/*
    Funzioni e variabili di utilità generale
*/

const base_date = "2022-05-23";

/**
 * Crea un oggetto Date impostando solo l'orario
 * @param {string} time L'orario da creare nel formato H:m:s o H:m
 * @returns Oggetto Date che utilizza una data di riferimento standard
 */
function createTime(time) {
    return new Date(`${base_date} ${time}`);
}

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
    BAD_REQUEST: function (message="Richiesta malformata") {
        let err = new Error(formatErrorMessage(message)); err.code = 400;
        return err;
    },
    UNAUTHORIZED: function (message="Non autorizzato") { // Non autenticato
        let err = new Error(formatErrorMessage(message)); err.code = 401;
        return err;
    },
    FORBIDDEN: function (message="Permessi mancanti") { // Autenticato ma senza permessi
        let err = new Error(formatErrorMessage(message)); err.code = 403;
        return err;
    },
    NOT_FOUND: function (message="Non trovato") {
        let err = new Error(formatErrorMessage(message)); err.code = 404;
        return err;
    }
}


module.exports = {
    createTime: createTime,

    error: error_generator,
    formatErrorMessage: formatErrorMessage,

    // Variabili utili
    MONGO_DUPLICATED_KEY: 11000,

}