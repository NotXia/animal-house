require('dotenv').config();
const { matchedData } = require('express-validator');
const OperatorModel = require("../models/auth/operator");
const UserModel = require("../models/auth/user");
const bcrypt = require("bcrypt");

async function insertOperator(req, res) {
    try {
        const newOperator = new OperatorModel({ 
            username: req.body.username,
            password: await bcrypt.hash(req.body.password, parseInt(process.env.SALT_ROUNDS)),
            email: req.body.email,
            name: req.body.name,
            surname: req.body.surname,
            gender: req.body.gender,
            role_id: req.body.role_id,
            permission: req.body.permission,
            working_time: req.body.working_time
        });
        await newCustomer.save();
    } catch (e) {
        res.sendStatus(500);
    }
    res.sendStatus(200);
}

async function insertCustomer(req, res) {
    try {
        const newCustomer = new UserModel({
            username: req.body.username,
            password: await bcrypt.hash(req.body.password, parseInt(process.env.SALT_ROUNDS)),
            email: req.body.email,
            name: req.body.name,
            surname: req.body.surname,
            gender: req.body.gender,
            address: req.body.address,
            phone: req.body.phone
        });
        await newCustomer.save();
    } catch (e) {
        console.debug(e);
        res.sendStatus(500);
    }
    res.sendStatus(200);
}

function searchUser(is_operator) {
    return async function(req, res) {
        const RoleModel = is_operator ? OperatorModel : UserModel;

        try {
            const user = await RoleModel.find({ username : req.params.username }).exec();
            res.send(user);
        }
        catch (e) {
            res.sendStatus(500);
        }
    };
}

function updateUser(is_operator) {
    return async function(req, res) {
        const RoleModel = is_operator ? OperatorModel : UserModel;

        const filter = { username : req.params.username };

        try {
            const user = await RoleModel.findOneAndUpdate(filter, req.body);
            console.log(user);
        } catch (e) {
            res.sendStatus(500);
        }
        res.sendStatus(200);
    }
}


function deleteUser(is_operator) {
    return async function(req, res) {
        const RoleModel = is_operator ? OperatorModel : UserModel;
        
        try {
            const user = await RoleModel.deleteOne({ username : req.params.username }).exec();
            console.log(user);
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