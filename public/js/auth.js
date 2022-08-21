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
            url: "/auth/refresh",
        }).done(function (data, textStatus, jqXHR) {
            _setAccessToken(data.access_token.value, data.access_token.expiration);
        }).catch((err) => {
            _current_refresh_request = null;
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
    if (!_isAccessTokenValid()) { await _requestNewToken(); }

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
async function isAuthenticated() {
    return ((await _getAccessToken()) != null);
}

/** 
 * Wrapper di $.ajax per fare richieste che richiedono autenticazione.
 * @param ajax_request parametri della richiesta (stessi di $.ajax)
 * @returns Promise della richiesta
*/
async function api_request(ajax_request) {
    // Aggiunge l'header di autenticazione
    if (!ajax_request.headers) { ajax_request.headers = {}; }
    ajax_request.headers.Authorization = `Bearer ${await _getAccessToken()}`;
    
    return $.ajax(ajax_request);
}

/**
 * Gestisce l'autenticazione dell'utente.
 * @param {string} username 
 * @param {string} password 
 * @returns {boolean} true se l'autenticazione ha avuto successo, false altrimenti
 */ 
async function login(username, password) {
    let logged = false;

    await $.ajax({
        type: "POST",
        url: "/auth/login",
        data: { username: username, password: password }
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
async function logout() {
    await $.ajax({
        url: "/auth/logout",
        type: 'POST'
    }).always(function () {
        _removeAccessToken();
    }).catch(function () {
        _removeAccessToken();
    });
}