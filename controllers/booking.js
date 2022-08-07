require('dotenv').config();
const utils = require("../utilities");
const error = require("../error_handler");
const OperatorModel = require("../models/auth/operator");
const ServiceModel = require("../models/services/service");
const moment = require("moment");

async function searchAvailabilities(req, res) {
    let availabilities = [];
    const hub_code = req.query.hub_code;
    const service_id = req.query.service_id;
    const start_date = req.query.start_date;
    const end_date = req.query.end_date;

    try {
        // Ricerca operatori
        let operator_query = { "$or": [], services_id: service_id };
        for (const days of utils.WEEKS) { operator_query["$or"].push( { [`working_time.${days}.hub`]: hub_code } ); }
        const operators = await OperatorModel.find(operator_query).exec();

        const service = await ServiceModel.findById(service_id).exec();

        for (const operator of operators) {
            availabilities = availabilities.concat(await operator.getAvailabilityData(start_date, end_date, hub_code, service.duration));
        }

        // Ordinamento cronologico
        // availabilities.sort((slot1, slot2) => moment(slot1.time.start).unix() - moment(slot2.time.start).unix());
    } catch (err) {
        return error.response(err, res);
    }

    return res.status(utils.http.OK).json(availabilities);
}

module.exports = {
    searchAvailabilities: searchAvailabilities,
}