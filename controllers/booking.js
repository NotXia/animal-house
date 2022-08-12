require('dotenv').config();
const utils = require("../utilities");
const error = require("../error_handler");
const OperatorModel = require("../models/auth/operator");
const ServiceModel = require("../models/services/service");
const BookingModel = require("../models/services/booking");
const moment = require("moment");

/* Inserimento appuntamento */
async function insertAppointment(req, res) {
    try {
        let newAppointment = matchedData(req);
        let toInsertAppointment = await new BookingModel(newAppointment).save();
        return res.status(utils.http.CREATED)
            .location(`${req.baseUrl}/${toInsertAppointment._id}`)
            .json(toInsertAppointment.getData());
    } catch (err) {
        return error.response(err, res);
    }
}

async function getAppointmentById(req, res) {
    try {
        const appointment = await BookingModel.findOne({ _id: req.params.appointment_id }).exec();
        if (!appointment) { throw error.generate.NOT_FOUND("Appuntamento inesistente"); }
        
        return res.status(utils.http.OK).json(appointment.getData());
    } catch (err) {
        return error.response(err, res);
    }
}

/* Ricerca degli slot disponibili */
async function searchAvailabilities(req, res) {
    let availabilities = [];
    const hub_code = req.query.hub_code;
    const service_id = req.query.service_id;
    const start_date = req.query.start_date;
    const end_date = req.query.end_date;

    try {
        // Ricerca dati servizio
        const service = await ServiceModel.findById(service_id).exec();

        // Ricerca operatori
        let operator_query = { "$or": [], services_id: service_id };
        for (const days of utils.WEEKS) { operator_query["$or"].push( { [`working_time.${days}.hub`]: hub_code } ); }
        const operators = await OperatorModel.find(operator_query).exec();

        // Unione di tutti gli slot disponibili
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
    insertAppointment: insertAppointment,
    getAppointmentById: getAppointmentById,
    searchAvailabilities: searchAvailabilities,
}