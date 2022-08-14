require('dotenv').config();
const SpeciesModel = require("../models/services/species");
const utils = require("../utilities");
const error = require("../error_handler");
const { matchedData } = require('express-validator');

// Inserimento di una specie
async function addSpecies(req, res) {
    try {
        let newSpecies = matchedData(req);
        let toInsertSpecies = await new ServiceModel(newSpecies).save();
        return res.status(utils.http.CREATED)
            .location(`${req.baseUrl}/${toInsertSpecies._id}`)
            .json(toInsertSpecies.getData());
    } catch (err) {
        if (err.code === utils.MONGO_DUPLICATED_KEY) {
            err = error.generate.CONFLICT({ field: "name", message: "Nome già in uso" });
        }
        return error.response(err, res);
    }
}

// Ricerca delle specie
async function getSpecies(req, res) {
    let species;
    let query = {};

    try {
        if (req.query.name) { query.name = {$regex : `.*${req.query.name}.*`}; }

        species = await ServiceModel.find(query).exec();
        species = species.map(species => species.getData());
        
        return res.status(utils.http.OK).json(species);
        
    } catch (err) {
        return error.response(err, res);
    }
}

module.exports = {
    addSpecies: addSpecies,
    getSpecies: getSpecies,
}