require('dotenv').config();
const mongoose = require("mongoose");
const UserModel = require("../models/auth/user");
const OperatorModel = require("../models/auth/operator");
const CustomerModel = require("../models/auth/customer");
const bcrypt = require("bcrypt");
const utils = require("../utilities");
const error = require("../error_handler");

async function insertOperator(req, res) {
    let data = res.locals; // Estrae i dati validati
    data.user.password = await bcrypt.hash(data.user.password, parseInt(process.env.SALT_ROUNDS));
    let new_operator = undefined;
    let new_user = undefined;

    try {
        new_operator = await new OperatorModel(data.operator).save();
        
        data.user.permission.operator = true;
        data.user.type_id = new_operator._id;
        new_user = await new UserModel(data.user).save();

        return res.status(utils.http.CREATED).json({});
    } catch (e) {
        if (e.code === utils.MONGO_DUPLICATED_KEY) {
            await OperatorModel.findByIdAndDelete(new_operator._id).exec().catch((err) => {}); // Cancella i dati inseriti
            return res.status(utils.http.CONFLICT).json(error.formatMessage(utils.http.CONFLICT));
        }
        return res.sendStatus(utils.http.INTERNAL_SERVER_ERROR);
    }
}

async function insertCustomer(req, res) {
    let data = res.locals; // Estrae i dati validati
    data.user.password = await bcrypt.hash(data.user.password, parseInt(process.env.SALT_ROUNDS));
    let new_customer = undefined;
    let new_user = undefined;

    try {
        new_customer = await new CustomerModel(data.customer).save();

        data.user.permission = { customer: true };
        data.user.type_id = new_customer._id;
        new_user = await new UserModel(data.user).save();

        return res.status(utils.http.CREATED).json({});
    } catch (e) {
        if (e.code === utils.MONGO_DUPLICATED_KEY) {
            await CustomerModel.findByIdAndDelete(new_customer._id).exec().catch((err) => {}); // Cancella i dati inseriti
            return res.status(utils.http.CONFLICT).json(error.formatMessage(utils.http.CONFLICT)); 
        }
        return res.sendStatus(utils.http.INTERNAL_SERVER_ERROR);
    }
}

function searchUser(is_operator) {
    return async function(req, res) {
        try {
            const user = await UserModel.findOne({ username: req.params.username }).populate(is_operator ? "operator" : "customer").exec();
            if (!user) { res.status(utils.http.NOT_FOUND).json(error.formatMessage(utils.http.NOT_FOUND)); }

            return res.status(utils.http.OK).json(user);
        }
        catch (e) {
            return res.sendStatus(utils.http.INTERNAL_SERVER_ERROR);
        }
    };
}

function updateUser(is_operator) {
    return async function(req, res) {
        let data = res.locals;

        try {
            let user;

            // Aggiornamento dei dati generici dell'utente
            if (data.user) { 
                if (data.user.password) { data.user.password = await bcrypt.hash(data.user.password, parseInt(process.env.SALT_ROUNDS)) };
                user = await UserModel.findOneAndUpdate({ username: req.params.username }, data.user);
                if (!user) { return res.status(utils.http.NOT_FOUND).json(error.formatMessage(utils.http.NOT_FOUND)); }
            }

            // Aggiornamento dei dati specifici
            if (is_operator && data.operator) {
                const operator = await OperatorModel.findByIdAndUpdate(user.type_id, data.operator);
                if (!operator) { return res.status(utils.http.NOT_FOUND).json(error.formatMessage(utils.http.NOT_FOUND)); }
            } 
            else if (!is_operator && data.customer) {
                const customer = await CustomerModel.findByIdAndUpdate(user.type_id, data.customer);
                if (!customer) { return res.status(utils.http.NOT_FOUND).json(error.formatMessage(utils.http.NOT_FOUND)); }
            }
        } catch (e) {
            return res.sendStatus(utils.http.INTERNAL_SERVER_ERROR);
        }
        return res.sendStatus(utils.http.OK);
    }
}


function deleteUser(is_operator) {
    return async function(req, res) {

        try {
            const user = await UserModel.findOne({ username: req.params.username }).populate(is_operator ? "operator" : "customer").exec();
            
            // Cancellazione utenza
            const deleted_user = await UserModel.findByIdAndDelete(user._id);
            if (deleted_user.deletedCount === 0) { return res.status(utils.http.NOT_FOUND).json(error.formatMessage(utils.http.NOT_FOUND)); }

            // Cancellazione dati specifici
            if (is_operator) {
                const deleted_operator = await OperatorModel.findByIdAndDelete(user.operator._id);
                if (deleted_operator.deletedCount === 0) { return res.status(utils.http.NOT_FOUND).json(error.formatMessage(utils.http.NOT_FOUND)); }
            }
            else {
                const deleted_customer = await CustomerModel.findByIdAndDelete(user.customer._id);
                if (deleted_customer.deletedCount === 0) { return res.status(utils.http.NOT_FOUND).json(error.formatMessage(utils.http.NOT_FOUND)); }
            }
        } catch (e) {
            return res.sendStatus(utils.http.INTERNAL_SERVER_ERROR);
        }

        return res.sendStatus(utils.http.OK);
    }
}

module.exports = {
    insertOperator: insertOperator,
    insertCustomer: insertCustomer,
    searchUser: searchUser,
    updateUser: updateUser,
    deleteUser: deleteUser
}