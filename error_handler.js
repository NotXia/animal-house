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
 * @returns Messaggio formattato
 */
function formatErrorMessage(err_message) {
    if (typeof err_message === "number") { err_message = defaultErrorMessage(err_message); }

    if (typeof err_message === "string") {
        err_message = { message: err_message };
    }

    return JSON.stringify(err_message);
}

function errorGenerator(code) {
    return function(message="") {
        if (message.length === 0) { message = defaultErrorMessage(code); }
        let err = new Error(formatErrorMessage(message)); 
        err.code = code;
        return err;
    };
}

const errors = {
    BAD_REQUEST:    errorGenerator(http.BAD_REQUEST),
    UNAUTHORIZED:   errorGenerator(http.UNAUTHORIZED),
    FORBIDDEN:      errorGenerator(http.FORBIDDEN),
    NOT_FOUND:      errorGenerator(http.NOT_FOUND)
}

function errorHandler(err, req, res, next) {
    if (err) {
        switch (err.code) {
            case http.BAD_REQUEST:
            case http.UNAUTHORIZED:
            case http.FORBIDDEN:
            case http.NOT_FOUND:
            case http.CONFLICT:
                return res.status(err.code).send(JSON.parse(err.message));
            default:
                return res.status(http.INTERNAL_SERVER_ERROR).send();
        }
    }
    else {
        return next();
    }
}

module.exports = {
    errorHandler: errorHandler,
    generate: errors,
    formatMessage: formatErrorMessage,
    defaultMessage: defaultErrorMessage
};