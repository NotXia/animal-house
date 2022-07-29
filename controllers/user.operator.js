require('dotenv').config();
const validator = require("express-validator");
const UserModel = require("../models/auth/user");
const utils = require("../utilities");
const error = require("../error_handler");


/* Aggiunge un elemento all'array delle assenze */
async function insertAbsenceTime(req, res) {
    let absence;

    try {
        // Ricerca utenza
        const user = await UserModel.findOne({ username: req.params.username }).exec();
        if (!user) { throw error.generate.NOT_FOUND("Utente inesistente"); }

        // Inserimento nuova assenza
        const updated_operator_data = await user.updateType({ "$push": { absence_time: req.body.absence_time } });

        absence = updated_operator_data.getAbsenceTime();
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
        if (!user) { throw error.generate.NOT_FOUND("Utente inesistente"); }

        absence = (await user.findType()).getAbsenceTime();
    } catch (err) {
        return error.response(err, res);
    }

    return res.status(utils.http.OK).json(absence);
}

/* Aggiorna l'array delle assenze */
async function deleteAbsenceTimeByIndex(req, res) {
    try {
        // Ricerca utenza
        const user = await UserModel.findOne({ username: req.params.username }).exec();
        if (!user) { throw error.generate.NOT_FOUND("Utente inesistente"); }

        // Verifica esistenza indice
        const operator_data = await user.findType();
        if (!operator_data.absence_time[parseInt(req.params.absence_time_index)]) { throw error.generate.NOT_FOUND("Valore inesistente"); }
        
        // Rimozione elemento all'indice
        await user.updateType({ $unset: { [`absence_time.${req.params.absence_time_index}`]: 1 } });
        await user.updateType({ $pull: { absence_time: null } });
    } catch (err) {
        return error.response(err, res);
    }

    return res.sendStatus(utils.http.NO_CONTENT);
}


module.exports = {
    insertAbsenceTime: insertAbsenceTime,
    getAbsenceTime: getAbsenceTime,
    deleteAbsenceTimeByIndex: deleteAbsenceTimeByIndex
}