require('dotenv').config();
const OperatorModel = require("../models/auth/operator");
const UserModel = require("../models/auth/user");

async function insertOperator(req, res) {

}

async function insertCustomer(req, res) {
    
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

async function updateUser(req, res) {
    
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