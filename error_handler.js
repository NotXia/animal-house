const { http } = require("./utilities");

function defaultErrorMessage(code) {
    switch (code) {
        case http.BAD_REQUEST:
            return "Richiesta malformata";
        case http.UNAUTHORIZED:
            return "Non autorizzato";
        case http.FORBIDDEN:
            return "Permessi insufficienti"
        case http.NOT_FOUND:
            return "Risorsa non trovata";
        case http.CONFLICT:
            return "Risorsa già esistente";
        case http.INTERNAL_SERVER_ERROR:
            return "Errore interno";
        default:
            return "";
    }
}

/**
 * Crea un formato adatto per un messaggio di errore.
 * Se il messaggio è un numero, si assume che sia un codice HTTP e lo si sostituisce con il corrispondente messaggio di default.
 * Se il messaggio è una stringa pura, viene inglobato in un object, altrimenti rimane inalterato.
 * @param {string} err_message 
 * @returns Object contenente il messaggio formattato 
 */
function formatErrorMessage(err_message) {
    if (typeof err_message === "number") { err_message = defaultErrorMessage(err_message); }

    if (typeof err_message === "string") {
        err_message = { message: err_message };
    }

    return err_message;
}

/**
 * Funzione generatrice che crea una funzione per la generazione di errori
 * @param {number} code     Codice HTTP dell'errore 
 * @returns Funzione che crea l'errore
 */
function _errorGenerator(code) {
    return function(message="") {
        if (message.length === 0) { message = defaultErrorMessage(code); }
        let err = new Error(JSON.stringify(formatErrorMessage(message))); 
        err.code = code;
        return err;
    };
}

/* 
    Funzioni associate ai codici HTTP per creare il relativo oggetto Error.
    Le funzioni hanno signature f(message="")
*/
const errors = {
    BAD_REQUEST:    _errorGenerator(http.BAD_REQUEST),
    UNAUTHORIZED:   _errorGenerator(http.UNAUTHORIZED),
    FORBIDDEN:      _errorGenerator(http.FORBIDDEN),
    NOT_FOUND:      _errorGenerator(http.NOT_FOUND),
    CONFLICT:      _errorGenerator(http.CONFLICT)
}

/**
 * Invia la risposta al client in base all'errore.
 */
function errorResponse(err, res) {
    switch (err.code) {
        case http.BAD_REQUEST:
        case http.UNAUTHORIZED:
        case http.FORBIDDEN:
        case http.NOT_FOUND:
        case http.CONFLICT:
            return res.status(err.code).json(JSON.parse(err.message));
        default:
            console.error(err);
            return res.status(http.INTERNAL_SERVER_ERROR).json(formatErrorMessage("Problema interno"));
    }
}

/**
 * Gestore globale degli errori provenienti dal middleware.
 */
function middlewareErrorHandler(err, req, res, next) {
    if (err) {
        return errorResponse(err, res);
    }
    else {
        return next();
    }
}

module.exports = {
    middlewareErrorHandler: middlewareErrorHandler,
    generate: errors,
    formatMessage: formatErrorMessage,
    defaultMessage: defaultErrorMessage,
    response: errorResponse,
};