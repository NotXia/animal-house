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
            .json(toInsertHub.getData());
    } catch (err) {
        if (err.code === utils.MONGO_DUPLICATED_KEY) {
            err = error.generate.CONFLICT({ field: "code", message: "Codice già in uso" });
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

// Ricerca di un hub dato il codice
async function getHubByCode(req, res) {
    try {
        const hub = await HubModel.findOne({ code: req.params.code }).exec();
        if (!hub) { throw error.generate.NOT_FOUND("Hub inesistente"); }
        
        return res.status(utils.http.OK).json(hub.getData());
    } catch (err) {
        return error.response(err, res);
    }
}

module.exports = {
    insertService: insertService,
    getServices: getServices,
    // getHubByCode: getHubByCode,
    // updateHub: updateHub,
    // deleteHub: deleteHub
}