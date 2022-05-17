require('dotenv').config();
const OperatorModel = require("../models/auth/operator");
const UserModel = require("../models/auth/user");

async function insertOperator(req, res) {
    try {
        const newOperator = new OperatorModel({ 
            username: req.body.username,
            password: req.body.password,
            email: req.body.email,
            name: req.body.name,
            surname: req.body.surname,
            gender: req.body.gender,
            enabled: req.body.enabled,
            role_id: req.body.role_id,
            permission: req.body.permission,
            working_time: req.body.working_time,
            absence_time: req.body.absence_time
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
            password: req.body.password,
            email: req.body.email,
            name: req.body.name,
            surname: req.body.surname,
            gender: req.body.gender,
            address: req.body.address,
            phone: req.body.phone
        });
        await newCustomer.save();
    } catch (e) {
        res.sendStatus(500);
    }
    res.sendStatus(200);
}

function searchUser(is_operator) {
    return async function(req, res) {
        // console.log(is_operator);
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
        // console.log(is_operator);
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
    search: searchUser,
    update: updateUser,
    delete: deleteUser
}