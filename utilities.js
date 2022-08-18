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

const http_code = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    SEE_OTHER: 303,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500
}

module.exports = {
    createTime: createTime,

    http: http_code,

    // Variabili utili
    MONGO_DUPLICATED_KEY: 11000,

    WEEKS: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
}