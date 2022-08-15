require('dotenv').config();
const AnimalModel = require("../models/animals/animal");
const SpeciesModel = require("../models/animals/species");
const UserModel = require("../models/auth/user");
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

// Aggiunta di un animale
async function addAnimal(req, res) {
    try {
        let newAnimal = matchedData(req);
        
        // Controllo se la specie inserita esiste
        const insertedSpecies = await SpeciesModel.findOne({ name: newAnimal.species }).exec();
        if(!insertedSpecies) { throw error.generate.NOT_FOUND("Specie inesistente"); }

        let toInsertAnimal = await new AnimalModel(newAnimal).save();
        return res.status(utils.http.CREATED)
            .location(`${req.baseUrl}/${toInsertAnimal._id}`)
            .json(toInsertAnimal.getData());
    } catch (err) {
        return error.response(err, res);
    }
}

// Ricerca animali di un cliente
async function getAnimals(req, res) {
    let animals;

    try {
        const customer_user = await UserModel.findOne({ username: req.params.username }).exec();
        if(!customer_user) { throw error.generate.NOT_FOUND("Utente inesistente"); }

        // Estrazione oggetto customer da user
        const customer = await customer_user.findType();

        animals = await UserModel.find({ username: req.params.username }, { animals_id : 1 }).exec();
        animals = animals.map(animal => animal.getData());

        return res.status(utils.http.OK).json(animals);
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
    addAnimal: addAnimal,
    getAnimals: getAnimals,
    updateAnimal: updateAnimal,
    deleteAnimal: deleteAnimal
}