require('dotenv').config();
const HubModel = require("../models/services/hub");
const OperatorModel = require("../models/auth/operator");
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
    } catch (err) {
        if (err.code === utils.MONGO_DUPLICATED_KEY) {
            err = error.generate.CONFLICT({ field: "code", message: "Codice già in uso" });
        }
        return error.response(err, res);
    }
}

// Ricerca di tutti gli hub
async function getHubs(req, res) {
    let hubs;
    let query = {};

    if (req.query.lat != undefined && req.query.lon != undefined) {
        query.position = {
            "$near": {
                "$geometry": { type: "Point", coordinates: [ req.query.lat , req.query.lon ] }
            }
        }
    }

    try {
        if (req.query.service_id) {
            // Estrazione operatori in grado di erogare il servizio
            const operators = await OperatorModel.find({ services_id: req.query.service_id }, { working_time: 1 }).exec();

            // Estrazione hub
            let available_hubs = new Set();
            for (const operator of operators) {
                for (const day of utils.WEEKS) { operator.working_time[day].forEach((working_slot) => available_hubs.add(working_slot.hub)); }
            }
            available_hubs = [...available_hubs];

            query.code = { "$in": available_hubs };
        }

        hubs = await HubModel.find(query)
                .limit(req.query.page_size)
                .skip(req.query.page_number)
                .exec();
        hubs = hubs.map(hub => hub.getData());
        
        return res.status(utils.http.OK).json(hubs);
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

// Aggiornamento di un hub dato il codice
async function updateHub(req, res) {
    try {
        const to_change_hub = req.params.code;
        const updated_data = matchedData(req, { locations: ["body"] });

        let updated_hub = await HubModel.findOne({ code: to_change_hub }).exec();
        if (!updated_hub) { throw error.generate.NOT_FOUND("Hub inesistente"); }
        for (const [field, value] of Object.entries(updated_data)) { updated_hub[field] = value; }
        await updated_hub.save();

        return res.status(utils.http.OK).json(updated_hub.getData());
    } catch (err) {
        return error.response(err, res);
    }
}

// Cancellazione di un hub dato il codice
async function deleteHub(req, res) {
    try {
        const deletedHub = await HubModel.findOneAndDelete({ code: req.params.code });
        if (!deletedHub) { throw error.generate.NOT_FOUND("Hub inesistente"); }
        
        return res.sendStatus(utils.http.NO_CONTENT);
    } catch (err) {
        return error.response(err, res);
    }
}

module.exports = {
    insertHub: insertHub,
    getHubs: getHubs,
    getHubByCode: getHubByCode,
    updateHub: updateHub,
    deleteHub: deleteHub
}