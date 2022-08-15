require('dotenv').config();
const AnimalModel = require("../models/animals/animal");
const utils = require("../utilities");
const error = require("../error_handler");
const { matchedData } = require('express-validator');

// Ricerca di un animale dato il suo id
async function getAnimalById(req, res) {
    try {
        const animal = await AnimalModel.findById(req.params.animal_id).exec();
        if (!animal) { throw error.generate.NOT_FOUND("Animale inesistente"); }
        
        return res.status(utils.http.OK).json(animal.getData());
    } catch (err) {
        return error.response(err, res);
    }
}

// Aggiornamento di un animale dato il suo id
async function updateAnimal(req, res) {
    try {
        const to_update_animal = req.params.animal_id;
        const updated_data = matchedData(req, { locations: ["body"] });

        let updated_animal = await AnimalModel.findByIdAndUpdate(to_update_animal, updated_data, { new: true });
        if (!updated_animal) { throw error.generate.NOT_FOUND("Animale inesistente"); }

        return res.status(utils.http.OK).json(updated_animal.getData());
    } catch (err) {
        return error.response(err, res);
    }
}

// Cancellazione di un animale dato il suo id
async function deleteAnimal(req, res) {
    try {
        const to_delete_animal = req.params.animal_id;

        const deletedAnimal = await AnimalModel.findByIdAndDelete(to_delete_animal);
        if (!deletedAnimal) { throw error.generate.NOT_FOUND("Animale inesistente"); }
        
        return res.sendStatus(utils.http.NO_CONTENT);
    } catch (err) {
        return error.response(err, res);
    }
}

module.exports = {
    getAnimalById: getAnimalById,
    updateAnimal: updateAnimal,
    deleteAnimal: deleteAnimal
}