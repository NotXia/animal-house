/*
    Funzioni e variabili di utilità generale
*/

const base_date = "2022-05-23";

/**
 * Crea un oggetto Date impostando solo l'orario
 * @param {string} time L'orario da creare nel formato H:m:s o H:m
 * @returns Oggetto Date time che utilizza una data di riferimento standard
 */
function createTime(time) {
    return new Date(`${base_date} ${time}`);
}

module.exports = {
    createTime: createTime
}