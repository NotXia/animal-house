/**
 * Operazioni sull'access token
 */

const _ACCESS_TOKEN_NAME = "access_token";
const _ACCESS_TOKEN_EXPIRATION = "access_token_expiration"; 

/* Indica se l'access token corrente è valido */
function _isAccessTokenValid() {
    const expiration = parseInt(sessionStorage.getItem(_ACCESS_TOKEN_EXPIRATION));
    return (new Date(expiration) > new Date());
}

/* Rinnova l'access token */
async function _requestNewToken() {
    await $.ajax({
        type: "POST",
        url: "/auth/refresh",
    }).done(function (data, textStatus, jqXHR) {
        _setAccessToken(data.access_token.value, data.access_token.expiration);
    }).catch((err) => {
        console.log(err.responseJSON);
    });
}

/* Salva il valore dell'access token */
function _setAccessToken(token, expiration) {
    sessionStorage.setItem(_ACCESS_TOKEN_NAME, token);
    sessionStorage.setItem(_ACCESS_TOKEN_EXPIRATION, expiration);
}

/* Restituisce l'access token, rinnovandolo se necessario */
function _getAccessToken() {
    if (!_isAccessTokenValid()) { _requestNewToken(); }

    return sessionStorage.getItem(_ACCESS_TOKEN_NAME);
}

/* Rimuove l'access token */
function _removeAccessToken() {
    sessionStorage.removeItem(_ACCESS_TOKEN_NAME);
    sessionStorage.removeItem(_ACCESS_TOKEN_EXPIRATION);
}



/** 
 * Indica se l'utente è autenticato
 * @returns {boolean} true se l'utente è autenticato, false altrimenti
*/
function isAuthenticated() {
    return !_getAccessToken();
}

/** 
 * Wrapper di $.ajax per fare richieste che richiedono autenticazione
 * @param ajax_request parametri della richiesta (stessi di $.ajax)
 * @returns Promise della richiesta
*/
function api_request(ajax_request) {
    // Aggiunge l'header di autenticazione
    if (!ajax_request.headers) { ajax_request.headers = {}; }
    ajax_request.headers.Authorization = `Bearer ${_getAccessToken()}`;
    
    return $.ajax(ajax_request);
}

/**
 * Gestisce l'autenticazione dell'utente
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
    }).catch((err) => {
        console.log(err.responseJSON);
    });

    return logged;
}

/**
 * Gestisce il logout dell'utente
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