require('dotenv').config();
const validator = require("express-validator");
const UserModel = require("../models/auth/user");
const utils = require("../utilities");
const error = require("../error_handler");
const moment = require("moment");


/* Aggiunge un elemento all'array delle assenze */
async function insertAbsenceTime(req, res) {
    let absence;

    try {
        // Ricerca utenza
        const user = await UserModel.findOne({ username: req.params.username }).exec();
        if (!user || !user.isOperator()) { throw error.generate.NOT_FOUND("Utente inesistente"); }

        // Inserimento nuova assenza
        let operator = await user.findType();
        operator.absence_time.push(req.body.absence_time);
        await operator.save();

        absence = operator.getAbsenceTimeData();
    } catch (err) {
        return error.response(err, res);
    }

    return res.status(utils.http.CREATED).json(absence);
}

/* Restituisce l'array delle assenze */
async function getAbsenceTime(req, res) {
    let absence;

    try {
        // Ricerca utenza
        const user = await UserModel.findOne({ username: req.params.username }).exec();
        if (!user || !user.isOperator()) { throw error.generate.NOT_FOUND("Utente inesistente"); }

        absence = (await user.findType()).getAbsenceTimeData();
    } catch (err) {
        return error.response(err, res);
    }

    return res.status(utils.http.OK).json(absence);
}

/* Cancella un elemento dall'array delle assenze */
async function deleteAbsenceTimeByIndex(req, res) {
    try {
        // Ricerca utenza
        const user = await UserModel.findOne({ username: req.params.username }).exec();
        if (!user || !user.isOperator()) { throw error.generate.NOT_FOUND("Utente inesistente"); }

        // Verifica esistenza indice
        let operator_data = await user.findType();
        if (!operator_data.absence_time[parseInt(req.params.absence_time_index)]) { throw error.generate.NOT_FOUND("Valore inesistente"); }
        
        // Rimozione elemento all'indice
        operator_data.absence_time.splice(parseInt(req.params.absence_time_index), 1);
        await operator_data.save();
    } catch (err) {
        return error.response(err, res);
    }

    return res.sendStatus(utils.http.NO_CONTENT);
}


/* Ricerca dell'orario di lavoro */
async function getWorkingTime(req, res) {
    let working_time;

    try {
        // Ricerca utenza
        const user = await UserModel.findOne({ username: req.params.username }).exec();
        if (!user || !user.isOperator()) { throw error.generate.NOT_FOUND("Utente inesistente"); }

        const operator_data = await user.findType();
        working_time = operator_data.getWorkingTimeData();
    } catch (err) {
        return error.response(err, res);
    }

    return res.status(utils.http.OK).json(working_time);
}

/* Aggiornamento dell'orario di lavoro */
async function updateWorkingTime(req, res) {
    let updated_working_time;

    try {
        // Ricerca utenza
        let user = await UserModel.findOne({ username: req.params.username }).exec();
        if (!user || !user.isOperator()) { throw error.generate.NOT_FOUND("Utente inesistente"); }

        // Aggiornamento
        let operator = await user.findType();
        operator.working_time = req.body.working_time;
        await operator.save();

        updated_working_time = operator.getWorkingTimeData();
    } catch (err) {
        return error.response(err, res);
    }

    return res.status(utils.http.OK).json(updated_working_time);
}


/* Ricerca delle disponibilità */
async function getAvailabilities(req, res) {
    let availabilities;

    try {
        // Ricerca utenza
        const user = await UserModel.findOne({ username: req.params.username }).exec();
        if (!user) { throw error.generate.NOT_FOUND("Utente inesistente"); }
        const operator_data = await user.findType();
        
        availabilities = await operator_data.getAvailabilityData(req.query.start_date, req.query.end_date, req.query.hub, req.query.slot_size);
    } catch (err) {
        return error.response(err, res);
    }

    return res.status(utils.http.OK).json(availabilities);
}


module.exports = {
    insertAbsenceTime: insertAbsenceTime,
    getAbsenceTime: getAbsenceTime,
    deleteAbsenceTimeByIndex: deleteAbsenceTimeByIndex,
    getWorkingTime: getWorkingTime,
    updateWorkingTime: updateWorkingTime,
    getAvailabilities: getAvailabilities
}