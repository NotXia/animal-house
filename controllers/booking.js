require('dotenv').config();
const utils = require("../utilities");
const error = require("../error_handler");
const OperatorModel = require("../models/auth/operator");
const ServiceModel = require("../models/services/service");
const BookingModel = require("../models/services/booking");
const UserModel = require("../models/auth/user");
const AnimalModel = require("../models/animals/animal");
const { matchedData } = require('express-validator');

/* Inserimento appuntamento */
async function insertAppointment(req, res) {
    try {
        let newAppointment = matchedData(req);

        // Controllo se il cliente sia effettivamente un cliente
        const user_customer = await UserModel.findOne({ username: newAppointment.customer }).exec();
        if(!user_customer || user_customer.isOperator()) { throw error.generate.NOT_FOUND("Utente inesistente"); }

        // Controllo se l'operatore sia effettivamente un operatore
        const operator_user = await UserModel.findOne({ username: newAppointment.operator }).exec();
        if(!operator_user || !operator_user.isOperator()) { throw error.generate.NOT_FOUND("Utente inesistente"); }

        // Controllo se l'animale sia effettivamente un animale
        const inserted_animal = await AnimalModel.findById(newAppointment.animal_id).exec();
        if(!inserted_animal) { throw error.generate.NOT_FOUND("Animale inesistente"); }

        // Estrazione oggetto operator da user
        const operator = await operator_user.findType();

        // Controllo se l'operatore in questione è disponibile nello slot indicato
        if(!await operator.isAvailableAt(newAppointment.time_slot.start, newAppointment.time_slot.end, newAppointment.hub)) {
            throw error.generate.BAD_REQUEST({ field: newAppointment.time_slot, message: "Slot non disponibile" });
        }

        let toInsertAppointment = await new BookingModel(newAppointment).save();
        return res.status(utils.http.CREATED)
            .location(`${req.baseUrl}/${toInsertAppointment._id}`)
            .json(toInsertAppointment.getData());
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

/* Ricerca appuntamento dato id */
async function getAppointmentById(req, res) {
    try {
        const to_search_appointment = req.params.appointment_id;

        const appointment = await BookingModel.findOne({ _id: to_search_appointment }).exec();
        if (!appointment) { throw error.generate.NOT_FOUND("Appuntamento inesistente"); }
        
        return res.status(utils.http.OK).json(appointment.getData());
    } catch (err) {
        return error.response(err, res);
    }
}

/* Ricerca appuntamenti utente dato username */
async function getAppointmentsByUser(req, res) {
    let appointments;
    try {
        const user = await UserModel.findOne({ username: req.query.username }).exec();
        if (!user) { throw error.generate.NOT_FOUND("Utente inesistente"); }
        if (user.isOperator()) {
            appointments = await BookingModel.find({ operator: req.query.username }).exec();
        } else {
            appointments = await BookingModel.find({ customer: req.query.username }).exec();
        }
        appointments = appointments.map(appointment => appointment.getData());
        return res.status(utils.http.OK).json(appointments);
    } catch (err) {
        return error.response(err, res);
    }
}

/* Cancellazione appuntamento dato id */
async function deleteAppointment(req, res) {
    try {
        const to_delete_appointment = req.params.appointment_id;

        const deletedAppointment = await BookingModel.findOneAndDelete({ _id: to_delete_appointment });
        if (!deletedAppointment) { throw error.generate.NOT_FOUND("Appuntamento inesistente"); }

        return res.sendStatus(utils.http.NO_CONTENT);
    } catch (err) {
        return error.response(err, res);
    }
}

module.exports = {
    insertAppointment: insertAppointment,
    searchAvailabilities: searchAvailabilities,
    getAppointmentById: getAppointmentById,
    getAppointmentsByUser: getAppointmentsByUser,
    deleteAppointment: deleteAppointment
}