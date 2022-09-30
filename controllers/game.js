require('dotenv').config();
const utils = require("../utilities");
const error = require("../error_handler");
const axios = require("axios").default;
const { translate } = require("../utilities");

function randomOfArray(array) {
    return array[Math.floor(Math.random()*array.length)];
}

/**
 * Formato lista di API:
 * { url: "Indirizzo dell'endpoint", get: "Funzione che dato il risultato della chiamata, estrae i dati interessanti"}
 */

const image_apis = {
    "dog": [
        { url: "https://dog.ceo/api/breeds/image/random", get: (res) => res.message },
        { url: "http://shibe.online/api/shibes", get: (res) => res[0] },
        { url: "https://random.dog/woof", get: (res) => `https://random.dog/${res}` }
    ],
    "cat": [
        { url: "https://cataas.com/cat?json=true", get: (res) => `https://cataas.com${res.url}` },
        { url: "https://aws.random.cat/meow", get: (res) => res.file }
    ],
    "bunny": [
        { url: "https://api.bunnies.io/v2/loop/random/?media=gif", get: (res) => res.media.gif }
    ],
    "lizard": [
        { url: "https://nekos.life/api/v2/img/lizard", get: (res) => res.url }
    ],
    "bird": [
        { url: "https://some-random-api.ml/img/birb", get: (res) => res.link }
    ],
    "fox": [
        { url: "https://randomfox.ca/floof/", get: (res) => res.image }
    ],
    "koala": [
        { url: "https://some-random-api.ml/img/koala", get: (res) => res.link }
    ],
    "panda": [
        { url: "https://some-random-api.ml/img/panda", get: (res) => res.link },
        { url: "https://some-random-api.ml/animal/red_panda", get: (res) => res.image }
    ],
    "duck": [
        { url: "https://random-d.uk/api/random", get: (res) => res.url }
    ],
    "kangaroo": [
        { url: "https://some-random-api.ml/animal/kangaroo", get: (res) => res.image }
    ],
}

const fact_apis = {
    "cat": [
        { url: "https://meowfacts.herokuapp.com", get: (res) => res.data[0] },
        { url: "https://some-random-api.ml/facts/cat", get: (res) => res.fact }
    ],
    "dog": [
        { url: "https://dog-api.kinduff.com/api/facts", get: (res) => res.facts[0] },
        { url: "https://some-random-api.ml/facts/dog", get: (res) => res.fact }
    ],
    "panda": [
        { url: "https://some-random-api.ml/facts/panda", get: (res) => res.fact }
    ],
    "fox": [
        { url: "https://some-random-api.ml/facts/fox", get: (res) => res.fact }
    ],
    "koala": [
        { url: "https://some-random-api.ml/facts/koala", get: (res) => res.fact }
    ],
    "bird": [
        { url: "https://some-random-api.ml/facts/bird", get: (res) => res.fact }
    ],
    "kangaroo": [
        { url: "https://some-random-api.ml/animal/kangaroo", get: (res) => res.fact }
    ]
}

// Restituisce un fatto sugli animali
async function getAnimalFact(req, res) {
    let fact = "";
    let animal = "";

    try {
        // Selezione di un animale per cui cercare un fatto
        animal = req.query.animal ? String(req.query.animal).toLowerCase() : randomOfArray(Object.keys(fact_apis));
        if (!fact_apis[animal]) { throw error.generate.NOT_FOUND("Animale non disponibile"); }

        // Scelta API
        const api = randomOfArray(fact_apis[animal]);

        // Estrazione fact
        const res = await axios({ method: "GET", url: api.url });
        fact = await translate(api.get(res.data), "EN", "IT");
    } catch (err) {
        return error.response(err, res);
    }

    return res.status(utils.http.OK).json({ animal: animal, fact: fact });
}

// Restituisce un'immagine di un animali
async function getAnimalImage(req, res) {
    let image_url = "";
    let animal = "";

    try {
        // Selezione di un animale per cui cercare un'immagine
        animal = req.query.animal ? String(req.query.animal).toLowerCase() : randomOfArray(Object.keys(image_apis));
        if (!image_apis[animal]) { throw error.generate.NOT_FOUND("Animale non disponibile"); }

        // Scelta API
        const api = randomOfArray(image_apis[animal]);

        // Estrazione immagine
        const res = await axios({ method: "GET", url: api.url });
        image_url = api.get(res.data);
    } catch (err) {
        return error.response(err, res);
    }

    return res.status(utils.http.OK).json({ animal: animal, image: image_url });
}

module.exports = {
    getAnimalFact: getAnimalFact,
    getAnimalImage: getAnimalImage
}
