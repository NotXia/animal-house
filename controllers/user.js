require('dotenv').config();
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
        data.user.type_name = "operator";
        new_user = await new UserModel(data.user).save();

        return res.status(utils.http.CREATED).json({});
    } catch (e) {
        
        if (e.code === utils.MONGO_DUPLICATED_KEY) {
            await OperatorModel.findByIdAndDelete(new_operator._id).exec().catch((err) => {}); // Cancella i dati inseriti
            e = error.generate.CONFLICT({ field: "username", message: "Username già in uso" });
        }
        return error.response(e, res);
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
        data.user.type_name = "customer";
        new_user = await new UserModel(data.user).save();

        return res.status(utils.http.CREATED).json({});
    } catch (e) {
        if (e.code === utils.MONGO_DUPLICATED_KEY) {
            await CustomerModel.findByIdAndDelete(new_customer._id).exec().catch((err) => {}); // Cancella i dati inseriti
            e = error.generate.CONFLICT({ field: "username", message: "Username già in uso" });
        }
        return error.response(e, res);
    }
}

function searchUser(is_operator) {
    return async function(req, res) {
        try {
            const user = await UserModel.findOne({ username: req.params.username }).populate(is_operator ? "operator" : "customer").exec();
            if (!user) { throw error.generate.NOT_FOUND("Utente inesistente"); }

            return res.status(utils.http.OK).json(user);
        }
        catch (e) {
            return error.response(e, res);
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
                if (!user) { throw error.generate.NOT_FOUND("Utente inesistente"); }
            }

            // Aggiornamento dei dati specifici
            if (is_operator && data.operator) {
                const operator = await OperatorModel.findByIdAndUpdate(user.type_id, data.operator);
                if (!operator) { throw error.generate.FORBIDDEN("L'utente non è un operatore"); }
            } 
            else if (!is_operator && data.customer) {
                const customer = await CustomerModel.findByIdAndUpdate(user.type_id, data.customer);
                if (!customer) { throw error.generate.FORBIDDEN("L'utente non è un cliente"); }
            }
        } catch (e) {
            return error.response(e, res);
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
            if (deleted_user.deletedCount === 0) { throw error.generate.NOT_FOUND("Utente inesistente"); }

            // Cancellazione dati specifici
            if (is_operator) {
                await OperatorModel.findByIdAndDelete(user.operator._id);
            }
            else {
                await CustomerModel.findByIdAndDelete(user.customer._id);
            }
        } catch (e) {
            return error.response(e, res);
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