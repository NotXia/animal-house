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

module.exports = {
    insertService: insertService,
    // getHubs: getHubs,
    // getHubByCode: getHubByCode,
    // updateHub: updateHub,
    // deleteHub: deleteHub
}