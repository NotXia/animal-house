require('dotenv').config();
const ServiceModel = require("../models/services/service");
const OperatorModel = require("../models/auth/operator");
const utils = require("../utilities");
const error = require("../error_handler");
const { matchedData } = require('express-validator');

// Inserimento di un servizio
async function insertService(req, res) {
    try {
        let newService = matchedData(req);
        let toInsertService = await new ServiceModel(newService).save();
        return res.status(utils.http.CREATED)
            .location(`${req.baseUrl}/${toInsertService._id}`)
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
    let query = {};
    
    try {
        if (req.query.name) { query.name = {$regex : `.*${req.query.name}.*`}; }

        if (req.query.hub_code) {
            // Estrazione operatori che lavorano nell'hub
            let operator_query = { "$or": [] };
            for (const days of utils.WEEKS) { operator_query["$or"].push( { [`working_time.${days}.hub`]: req.query.hub_code } ); }
            const operators = await OperatorModel.find(operator_query, { services_id: 1 }).exec();

            // Unione di tutti i servizi
            let available_services_id =  new Set();
            for (const operator of operators) {
                operator.services_id.forEach(service_id => { available_services_id.add(service_id) });
            }
            available_services_id = [...available_services_id];
    
            query._id = { "$in": available_services_id };
        }

        services = await ServiceModel.find(query).exec();
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

// Aggiornamento di un servizio
async function updateService(req, res) {
    try {
        const to_change_service = req.params.service_id;
        const updated_data = matchedData(req, { locations: ["body"] });

        if (updated_data.target) {
            updated_data.$set = { "target": updated_data.target };
            delete updated_data.target;
        }
        let updated_service = await ServiceModel.findByIdAndUpdate(to_change_service, updated_data, { new: true })
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