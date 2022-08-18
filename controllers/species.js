require('dotenv').config();
const SpeciesModel = require("../models/animals/species");
const utils = require("../utilities");
const error = require("../error_handler");
const { matchedData } = require('express-validator');

// Inserimento di una specie
async function addSpecies(req, res) {
    try {
        let newSpecies = matchedData(req);
        let toInsertSpecies = await new SpeciesModel(newSpecies).save();
        return res.status(utils.http.CREATED)
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

        species = await SpeciesModel.find(query).exec();
        species = species.map(species => species.getData());
        
        return res.status(utils.http.OK).json(species);
        
    } catch (err) {
        return error.response(err, res);
    }
}

// Modifica di una specie dato il nome
async function updateSpecies(req, res) {
    try {
        const to_change_species = req.params.name;
        const updated_data = matchedData(req, { locations: ["body"] });

        let updated_species = await SpeciesModel.findOne({name: to_change_species})
        if (!updated_species) { throw error.generate.NOT_FOUND("Specie inesistente"); }
        for (const [field, value] of Object.entries(updated_data)) { updated_species[field] = value; }
        await updated_species.save();

        return res.status(utils.http.OK).json(updated_species.getData());
    } catch (err) {
        return error.response(err, res);
    }
}

// Cancellazione di una specie
async function deleteSpecies(req, res) {
    try {
        const to_delete_species = req.params.name;

        const deletedSpecies = await SpeciesModel.findOneAndDelete({ name: to_delete_species });
        if (!deletedSpecies) { throw error.generate.NOT_FOUND("Specie inesistente"); }
        
        return res.sendStatus(utils.http.NO_CONTENT);
    } catch (err) {
        return error.response(err, res);
    }
}

module.exports = {
    addSpecies: addSpecies,
    getSpecies: getSpecies,
    updateSpecies: updateSpecies,
    deleteSpecies: deleteSpecies
}