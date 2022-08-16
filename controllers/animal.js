require('dotenv').config();
const AnimalModel = require("../models/animals/animal");
const SpeciesModel = require("../models/animals/species");
const UserModel = require("../models/auth/user");
const utils = require("../utilities");
const error = require("../error_handler");
const { matchedData } = require('express-validator');
const customer = require('../models/auth/customer');
const file_controller = require('./file');
const path = require("path");

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
        let newAnimal = matchedData(req, {locations: ["body"]});
        
        // Controllo se la specie inserita esiste
        const insertedSpecies = await SpeciesModel.findOne({ name: newAnimal.species }).exec();
        if(!insertedSpecies) { throw error.generate.NOT_FOUND("Specie inesistente"); }

        // Salvataggio immagine
        if (newAnimal.image_path) {
            newAnimal.image_path = path.basename(newAnimal.image_path); // Normalizzazione path
            await file_controller.utils.claim([newAnimal.image_path], process.env.CUSTOMER_ANIMAL_IMAGES_DIR_ABS_PATH);
        }

        const customer_user = await UserModel.findOne({ username: req.params.username }).exec();
        if(!customer_user) { throw error.generate.NOT_FOUND("Utente inesistente"); }

        
        let toInsertAnimal = await new AnimalModel(newAnimal).save();
        await customer_user.updateType({ $push: { animals_id: toInsertAnimal._id } });
        return res.status(utils.http.CREATED)
            .location(`/animals/${toInsertAnimal._id}`)
            .json(toInsertAnimal.getData());
    } catch (err) {
        return error.response(err, res);
    }
}

// Ricerca animali di un cliente
async function getAnimals(req, res) {    
    try {
        let animals;
        const customer_user = await UserModel.findOne({ username: req.params.username }).exec();
        if(!customer_user) { throw error.generate.NOT_FOUND("Utente inesistente"); }

        // Estrazione oggetto customer da user
        const customer = await customer_user.findType();

        // Cerca gli animali dell'utente dati gli id
        animals = await AnimalModel.find({ _id : {$in : customer.animals_id} });
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

        // Aggiornamento immagine
        if (updated_data.image_path) {
            updated_data.image_path = path.basename(updated_data.image_path); // Normalizzazione path
            const curr_animal = await AnimalModel.findById(to_update_animal).exec();

            if (curr_animal.image_path != updated_data.image_path) { // Aggiorna l'immagine se cambiata
                await file_controller.utils.claim([updated_data.image_path], process.env.CUSTOMER_ANIMAL_IMAGES_DIR_ABS_PATH);
                await file_controller.utils.delete([curr_animal.image_path], process.env.CUSTOMER_ANIMAL_IMAGES_DIR_ABS_PATH);
            }
        }

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

        // Cancellazione immagine
        if (deletedAnimal.image_path) {
            await file_controller.utils.delete([deletedAnimal.image_path], process.env.CUSTOMER_ANIMAL_IMAGES_DIR_ABS_PATH);
        }
        
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