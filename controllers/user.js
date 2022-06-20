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

    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const newOperator = await new OperatorModel(data.operator).save();
        
        data.user.permission.operator = true;
        data.user.type_id = newOperator._id;
        await new UserModel(data.user).save();

        await session.commitTransaction();
        session.endSession();
        return res.status(utils.http.CREATED).json({});
    } catch (e) {
        await session.abortTransaction();
        session.endSession();

        if (e.code === utils.MONGO_DUPLICATED_KEY) { return res.status(utils.http.CONFLICT).json(error.formatMessage(utils.http.CONFLICT)); }
        return res.sendStatus(utils.http.INTERNAL_SERVER_ERROR);
    }
}

async function insertCustomer(req, res) {
    let data = res.locals; // Estrae i dati validati
    data.user.password = await bcrypt.hash(data.user.password, parseInt(process.env.SALT_ROUNDS));

    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const newCustomer = await new CustomerModel(data.customer).save();

        data.user.permission = { customer: true };
        data.user.type_id = newCustomer._id;
        await new UserModel(data.user).save();

        await session.commitTransaction();
        session.endSession();
        return res.status(utils.http.CREATED).json({});
    } catch (e) {
        await session.abortTransaction();
        session.endSession();

        if (e.code === utils.MONGO_DUPLICATED_KEY) { return res.status(utils.http.CONFLICT).json(error.formatMessage(utils.http.CONFLICT)); }
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

        const session = await mongoose.startSession();
        try {
            session.startTransaction();

            let user;

            if (data.user) { // Aggiornamento dei dati generici dell'utente
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

            await session.commitTransaction();
            session.endSession();
        } catch (e) {
            await session.abortTransaction();
            session.endSession();

            console.warn(e);
            return res.sendStatus(utils.http.INTERNAL_SERVER_ERROR);
        }
        return res.sendStatus(utils.http.OK);
    }
}


function deleteUser(is_operator) {
    return async function(req, res) {

        const session = await mongoose.startSession();
        try {
            session.startTransaction();

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

            await session.commitTransaction();
            session.endSession();
        } catch (e) {
            await session.abortTransaction();
            session.endSession();
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