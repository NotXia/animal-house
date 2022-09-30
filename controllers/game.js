require('dotenv').config();
const utils = require("../utilities");
const error = require("../error_handler");
const axios = require("axios").default;
const { translate } = require("../utilities");

function randomOfArray(array) {
    return array[Math.floor(Math.random()*array.length)];
}

const fact_apis = {
    "cat": [
        { url: "https://meowfacts.herokuapp.com", get: (res) => res.data[0] }
    ]
}

// Restituisce un fatto sugli animali
async function getAnimalFact(req, res) {
    let fact = "";
    let animal = "";

    try {
        // Selezione di un animale per cui cercare un fatto
        animal = req.params.animal ? String(req.params.animal).toLowerCase() : randomOfArray(Object.keys(fact_apis));
        if (!fact_apis[animal]) { throw error.generate.NOT_FOUND("Animale non disponibile"); }

        // Estrazione API
        const api = randomOfArray(fact_apis[animal]);

        // Estrazione fact
        const res = await axios({ method: "GET", url: api.url });
        fact = await translate(api.get(res.data), "EN", "IT");
    } catch (err) {
        return error.response(err, res);
    }

    return res.status(utils.http.OK).json({ animal: animal, fact: fact });
}

module.exports = {
    getAnimalFact: getAnimalFact
}
