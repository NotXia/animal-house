/*
    Funzioni e variabili di utilità generale
*/

require("dotenv").config();
const axios = require("axios").default;


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

/**
 * Traduce un dato testo
 * @param {String} text             Testo da tradurre
 * @param {String} source_lang      Lingua originale
 * @param {String} dest_lang        Lingua in cui tradurre
 * @returns Testo tradotto
 */
async function translate(text, source_lang="EN", dest_lang="IT") {
    let translation = "";

    try {
        const res = await axios({
            method: "POST", url: "https://api-free.deepl.com/v2/translate",
            headers: { 
                "Authorization": `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`, 
                "Content-Type": "application/x-www-form-urlencoded" 
            },
            data: new URLSearchParams({
                text: text,
                source_lang: source_lang, target_lang: dest_lang
            })
        });
        
        translation = res.data.translations[0].text;
    }
    catch (err) {
        return text;
    }

    return translation;
}

module.exports = {
    createTime: createTime,
    translate: translate,

    http: http_code,

    // Variabili utili
    MONGO_DUPLICATED_KEY: 11000,

    WEEKS: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
}