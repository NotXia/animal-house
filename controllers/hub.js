require('dotenv').config();
const HubModel = require("../models/services/hub");
const utils = require("../utilities");
const error = require("../error_handler");
const { matchedData } = require('express-validator');

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

module.exports = {
    insertHub: insertHub,
}