import $ from "jquery";
import { DOMAIN } from "./const";
import { clearOnlyCustomerPreferences } from "./preferences";

/**
 * Operazioni sull'access token
 */

const _ACCESS_TOKEN_NAME = "access_token";
const _ACCESS_TOKEN_EXPIRATION = "access_token_expiration"; 


let _current_refresh_request = null; // Per salvare la richiesta di refresh dei token attualmente in corso (ed evitare richieste multiple)

/* Indica se l'access token corrente è valido */
function _isAccessTokenValid() {
    if (!sessionStorage.getItem(_ACCESS_TOKEN_EXPIRATION) || !sessionStorage.getItem(_ACCESS_TOKEN_NAME)) { return false; }

    const expiration = parseInt(sessionStorage.getItem(_ACCESS_TOKEN_EXPIRATION));
    return (new Date(expiration) > new Date());
}

/* Rinnova l'access token */
async function _requestNewToken() {
    if (!_current_refresh_request) {
        _current_refresh_request = $.ajax({
            type: "POST",
            url: `${DOMAIN}/auth/refresh`,
            xhrFields: { withCredentials: true }
        }).done(function (data, textStatus, jqXHR) {
            _setAccessToken(data.access_token.value, data.access_token.expiration);
        }).catch((err) => {
            _current_refresh_request = null;
            clearOnlyCustomerPreferences(); // Cancella preferenze se login fallito
        }).fail((err) => {
            _current_refresh_request = null;
            clearOnlyCustomerPreferences(); // Cancella preferenze se login fallito
        }).always(() => {
            _current_refresh_request = null;
        });
    }

    await _current_refresh_request;
}

/* Salva il valore dell'access token */
function _setAccessToken(token, expiration) {
    sessionStorage.setItem(_ACCESS_TOKEN_NAME, token);
    sessionStorage.setItem(_ACCESS_TOKEN_EXPIRATION, expiration);
}

/* Restituisce l'access token, rinnovandolo se necessario */
async function _getAccessToken() {
    if (!_isAccessTokenValid()) { 
        _removeAccessToken();
        await _requestNewToken(); 
    }

    return sessionStorage.getItem(_ACCESS_TOKEN_NAME);
}

/* Rimuove l'access token */
function _removeAccessToken() {
    sessionStorage.removeItem(_ACCESS_TOKEN_NAME);
    sessionStorage.removeItem(_ACCESS_TOKEN_EXPIRATION);
}


/** 
 * Indica se l'utente è autenticato.
 * @returns {boolean} true se l'utente è autenticato, false altrimenti
*/
export async function isAuthenticated() {
    return ((await _getAccessToken()) != null);
}

/** 
 * Wrapper di $.ajax per fare richieste che richiedono autenticazione.
 * @param ajax_request parametri della richiesta (stessi di $.ajax)
 * @returns Promise della richiesta
*/
export async function api_request(ajax_request) {
    // Aggiunge l'header di autenticazione
    if (!ajax_request.headers) { ajax_request.headers = {}; }
    if (await isAuthenticated()) {
        ajax_request.headers.Authorization = `Bearer ${await _getAccessToken()}`;
    }
    
    return $.ajax(ajax_request);
}

/**
 * Gestisce l'autenticazione dell'utente.
 * @param {string} username 
 * @param {string} password 
 * @returns {boolean} true se l'autenticazione ha avuto successo, false altrimenti
 */ 
export async function login(username, password, remember_me) {
    let logged = false;
    await $.ajax({
        type: "POST",
        url: `${DOMAIN}/auth/login`,
        data: { username: username, password: password, remember_me: remember_me },
        xhrFields: { withCredentials: true }
    }).done(function (data, textStatus, jqXHR) {
        _setAccessToken(data.access_token.value, data.access_token.expiration);
        logged = true;
    }).fail(function (jqXHR, textStatus, errorThrown) {
        logged = false;
    }) 
    .catch((err) => {
        logged = false;
    });
    
    return logged;
}

/**
 * Gestisce il logout dell'utente.
 */
export async function logout() {
    await $.ajax({
        url: `${DOMAIN}/auth/logout`,
        type: 'POST',
        xhrFields: { withCredentials: true }
    }).always(function () {
        _removeAccessToken();
    }).catch(function () {
        _removeAccessToken();
    });
}

/**
 * Decodifica del token JWT
 * Fonte: https://stackoverflow.com/questions/38552003/how-to-decode-jwt-token-in-javascript-without-using-a-library
 */
export function _parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
};

/**
 * Restituisce i dati dell'access token
 */
export async function getTokenData() {
    return _parseJwt(await _getAccessToken());
}

/**
 * Indica se l'utente è un operatore
 */
export async function isOperator() {
    return (await getTokenData()).is_operator;
}

/**
 * Indica se l'utente è un operatore
 */
export async function getUsername() {
    return (await getTokenData()).username;
}

export async function isAdmin() {
    try {
        const user_data = await api_request({
            type: "GET",
            url: `${DOMAIN}/users/operators/${encodeURIComponent(await getUsername())}`
        });

        return user_data.permissions.includes("admin");
    }
    catch (err) {
        return false;
    }
}