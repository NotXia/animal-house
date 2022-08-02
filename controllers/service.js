require('dotenv').config();
const ServiceModel = require("../models/services/service");
const utils = require("../utilities");
const error = require("../error_handler");
const { matchedData } = require('express-validator');

// Inserimento di un servizio
async function insertService(req, res) {
    try {
        let newService = matchedData(req);
        let toInsertService = await new ServiceModel(newService).save();
        return res.status(utils.http.CREATED)
            .location(`${req.baseUrl}/${toInsertService.name}`)
            .json(toInsertService.getData());
    } catch (err) {
        if (err.code === utils.MONGO_DUPLICATED_KEY) {
            err = error.generate.CONFLICT({ field: "name", message: "Nome già in uso" });
        }
        return error.response(err, res);
    }
}

// Ricerca di tutti i servizi
async function getServices(req, res) {
    let services;

    try {
        services = await ServiceModel.find({}).exec();
        services = services.map(service => service.getData());
        
        return res.status(utils.http.OK).json(services);
    } catch (err) {
        return error.response(err, res);
    }
}

// Ricerca di un servizio dato il nome
async function getServiceById(req, res) {
    try {
        const service = await ServiceModel.findOne({ _id: req.params.service_id }).exec();
        if (!service) { throw error.generate.NOT_FOUND("Servizio inesistente"); }
        
        return res.status(utils.http.OK).json(service.getData());
    } catch (err) {
        return error.response(err, res);
    }
}

// Aggiornamento di un servizio dato il nome
async function updateService(req, res) {
    try {
        const to_change_service = req.params.service_id;
        const updated_data = matchedData(req, { locations: ["body"] });

        let updated_service = await ServiceModel.findOneAndUpdate({ _id: to_change_service }, updated_data, { new: true }).exec();
        if (!updated_service) { throw error.generate.NOT_FOUND("Servizio inesistente"); }

        return res.status(utils.http.OK).json(updated_service.getData());
    } catch (err) {
        return error.response(err, res);
    }
}

// Cancellazione di un servizio dato il nome
async function deleteService(req, res) {
    try {
        const to_delete_service = req.params.service_id;

        const deletedService = await ServiceModel.findOneAndDelete({ _id: to_delete_service });
        if (!deletedService) { throw error.generate.NOT_FOUND("Servizio inesistente"); }
        
        return res.sendStatus(utils.http.NO_CONTENT);
    } catch (err) {
        return error.response(err, res);
    }
}

module.exports = {
    insertService: insertService,
    getServices: getServices,
    getServiceById: getServiceById,
    updateService: updateService,
    deleteService: deleteService
}