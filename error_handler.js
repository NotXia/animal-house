/**
 * Crea un formato adatto per un messaggio di errore.
 * Se il messaggio è una stringa pura, viene inglobato in un object, altrimenti rimane inalterato.
 * @param {string} err_message 
 * @returns Messaggio formattato
 */
function formatErrorMessage(err_message) {
    if (typeof err_message === "string") {
        err_message = { message: err_message };
    }

    return JSON.stringify(err_message);
}

const error_generator = {
    BAD_REQUEST: function (message = "Richiesta malformata") {
        let err = new Error(formatErrorMessage(message)); err.code = 400;
        return err;
    },
    UNAUTHORIZED: function (message = "Non autorizzato") { // Non autenticato
        let err = new Error(formatErrorMessage(message)); err.code = 401;
        return err;
    },
    FORBIDDEN: function (message = "Permessi mancanti") { // Autenticato ma senza permessi
        let err = new Error(formatErrorMessage(message)); err.code = 403;
        return err;
    },
    NOT_FOUND: function (message = "Non trovato") {
        let err = new Error(formatErrorMessage(message)); err.code = 404;
        return err;
    }
}

function errorHandler(err, req, res, next) {
    if (err) {
        switch (err.code) {
            case 400:
            case 401:
            case 403:
            case 404:
                return res.status(err.code).send(JSON.parse(err.message));
            default:
                return res.status(500).send();
        }
    }
    else {
        return next();
    }
}

module.exports = {
    errorHandler: errorHandler,
    generate: error_generator,
    formatMessage: formatErrorMessage
};