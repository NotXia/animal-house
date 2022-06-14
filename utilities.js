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

const error_generator = {
    BAD_REQUEST: function (message="Richiesta malformata") {
        let err = new Error(message); err.code = 400;
        return err;
    },
    UNAUTHORIZED: function (message="Non autorizzato") { // Non autenticato
        let err = new Error(message); err.code = 401;
        return err;
    },
    FORBIDDEN: function (message="Permessi mancanti") { // Autenticato ma senza permessi
        let err = new Error(message); err.code = 403;
        return err;
    },
    NOT_FOUND: function (message="Non trovato") {
        let err = new Error(message); err.code = 404;
        return err;
    }
}


module.exports = {
    createTime: createTime,

    error: error_generator,

    // Variabili utili
    MONGO_DUPLICATED_KEY: 11000,

}