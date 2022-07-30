require('dotenv').config();
const HubModel = require("../models/services/hub");
const utils = require("../utilities");
const error = require("../error_handler");
const { matchedData } = require('express-validator');
const hub = require('../middleware/hub');

// Inserimento di un hub
async function insertHub(req, res) {
    try {
        let newHub = matchedData(req);
        let toInsertHub = await new HubModel(newHub).save();
        return res.status(utils.http.CREATED)
            .location(`${req.baseUrl}/${toInsertHub.code}`)
            .json(toInsertHub.getData());
    } catch (e) {
        if (e.code === utils.MONGO_DUPLICATED_KEY) {
            e = error.generate.CONFLICT({ field: "code", message: "Codice già in uso" });
        }
        return error.response(e, res);
    }
}

// Ricerca di tutti gli hub
async function getHubs(req, res) {
    let hubs;

    try {
        hubs = await HubModel.find({}, { _id: 0 }).exec();
        hubs = hubs.map(hub => hub.getData());
    } catch (err) {
        return error.response(err, res);
    }

    return res.status(utils.http.OK).json(hubs);
}

module.exports = {
    insertHub: insertHub,
    getHubs: getHubs,
}