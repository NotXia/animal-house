require('dotenv').config();
const { matchedData } = require('express-validator');
const OperatorModel = require("../models/auth/operator");
const CustomerModel = require("../models/auth/customer");
const bcrypt = require("bcrypt");

async function insertOperator(req, res) {
    let data = matchedData(req); // Estrae i dati validati
    data.password = await bcrypt.hash(data.password, parseInt(process.env.SALT_ROUNDS));
    try {
        const newOperator = new OperatorModel(data);
        await newOperator.save();
        res.status(201).send({id: newOperator._id});
    } catch (e) {
        res.sendStatus(500);
    }
}

async function insertCustomer(req, res) {
    let data = matchedData(req); // Estrae i dati validati
    data.password = await bcrypt.hash(data.password, parseInt(process.env.SALT_ROUNDS));
    try {
        const newCustomer = new CustomerModel(data);
        await newCustomer.save();
        res.status(201).send({id: newCustomer._id});
    } catch (e) {
        res.sendStatus(500);
    }
}

function searchUser(is_operator) {
    return async function(req, res) {
        const RoleModel = is_operator ? OperatorModel : CustomerModel;

        try {
            const user = await RoleModel.findOne({ username : req.params.username }).exec();
            if (!user) { res.sendStatus(404); }
            res.status(200).send(user);
        }
        catch (e) {
            res.sendStatus(500);
        }
    };
}

function updateUser(is_operator) {
    return async function(req, res) {
        const RoleModel = is_operator ? OperatorModel : CustomerModel;
        
        const filter = { username : req.params.username };
        
        let data = matchedData(req, { locations: ["body"] });
        if (data.password) { data.password = await bcrypt.hash(data.password, parseInt(process.env.SALT_ROUNDS)); }

        try {
            const user = await RoleModel.findOneAndUpdate(filter, data);
            if (!user) { res.sendStatus(404); }
        } catch (e) {
            res.sendStatus(500);
        }
        res.sendStatus(200);
    }
}


function deleteUser(is_operator) {
    return async function(req, res) {
        const RoleModel = is_operator ? OperatorModel : CustomerModel;
        
        try {
            const user = await RoleModel.deleteOne({ username : req.params.username }).exec();
            if (user.deletedCount === 0) { res.sendStatus(404); }
        } catch (e) {
            res.sendStatus(500);
        }

        res.sendStatus(200);
    }
}

module.exports = {
    insertOperator: insertOperator,
    insertCustomer: insertCustomer,
    searchUser: searchUser,
    updateUser: updateUser,
    deleteUser: deleteUser
}