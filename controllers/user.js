require('dotenv').config();
const UserModel = require("../models/auth/user");
const OperatorModel = require("../models/auth/operator");
const CustomerModel = require("../models/auth/customer");
const PermissionModel = require("../models/auth/permission");
const bcrypt = require("bcrypt");
const utils = require("../utilities");
const error = require("../error_handler");

async function insertOperator(req, res) {
    let data = res.locals; // Estrae i dati validati
    data.user.password = await bcrypt.hash(data.user.password, parseInt(process.env.SALT_ROUNDS));
    if (!data.user.permissions) { data.user.permissions = []; }
    let new_operator = undefined;
    let new_user = undefined;

    try {
        new_operator = await new OperatorModel(data.operator).save();
        
        data.user.enabled = true;
        data.user.permissions.push("operator");
        data.user.type_id = new_operator._id;
        data.user.type_name = "operator";
        new_user = await new UserModel(data.user).save();

        return res.status(utils.http.CREATED).location(`${req.baseUrl}/operators/${new_user.username}`).json(await new_user.getAllData());
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
    if (!data.user.permissions) { data.user.permissions = []; }
    let new_customer = undefined;
    let new_user = undefined;

    try {
        new_customer = await new CustomerModel(data.customer).save();

        data.user.permissions = data.user.permissions.concat(["customer"]);
        data.user.type_id = new_customer._id;
        data.user.type_name = "customer";
        new_user = await new UserModel(data.user).save();

        return res.status(utils.http.CREATED).location(`${req.baseUrl}/customers/${new_user.username}`).json(await new_user.getAllData());
    } catch (e) {
        if (e.code === utils.MONGO_DUPLICATED_KEY) {
            await CustomerModel.findByIdAndDelete(new_customer._id).exec().catch((err) => {}); // Cancella i dati inseriti
            e = error.generate.CONFLICT({ field: "username", message: "Username già in uso" });
        }
        return error.response(e, res);
    }
}

/* Restituisce tutti i dati di un utente */
function searchUser(is_operator=false) {
    return async function (req, res) {
        try {
            const user = await UserModel.findOne({ username: req.params.username }).exec();
            if (!user) { throw error.generate.NOT_FOUND("Utente inesistente"); }
            if (is_operator && !user.isOperator()) { throw error.generate.NOT_FOUND("L'utente non è un operatore"); }
            if (!is_operator && user.isOperator()) { throw error.generate.NOT_FOUND("L'utente non è un cliente"); }

            return res.status(utils.http.OK).json(await user.getAllData());
        }
        catch (e) {
            return error.response(e, res);
        }
    }
}

/* Restituisce i dati pubblici di un utente */
async function searchUserProfile(req, res) {
    try {
        const user = await UserModel.findOne({ username: req.params.username }).exec();
        if (!user) { throw error.generate.NOT_FOUND("Utente inesistente"); }

        return res.status(utils.http.OK).json(await user.getPublicData());
    }
    catch (e) {
        return error.response(e, res);
    }
}

function updateUser(is_operator) {
    return async function(req, res) {
        let data = res.locals;
        let user;

        try {
            // Aggiornamento dei dati generici dell'utente
            if (data.user) { 
                if (data.user.password) { data.user.password = await bcrypt.hash(data.user.password, parseInt(process.env.SALT_ROUNDS)) };
                user = await UserModel.findOne({ username: req.params.username });
                if (!user) { throw error.generate.NOT_FOUND("Utente inesistente"); }
                for (const [field, value] of Object.entries(data.user)) { user[field] = value; }
                await user.save();
        
            }

            // Aggiornamento dei dati specifici
            if (is_operator && data.operator) {
                let operator = await OperatorModel.findById(user.type_id).exec();
                if (!operator) { throw error.generate.FORBIDDEN("L'utente non è un operatore"); }
                for (const [field, value] of Object.entries(data.operator)) { operator[field] = value; }
                await operator.save();
            } 
            else if (!is_operator && data.customer) {
                let customer = await CustomerModel.findById(user.type_id).exec();
                if (!customer) { throw error.generate.FORBIDDEN("L'utente non è un cliente"); }
                for (const [field, value] of Object.entries(data.customer)) { customer[field] = value; }
                await customer.save();
            }
        } catch (e) {
            return error.response(e, res);
        }

        return res.status(utils.http.OK).json(await user.getAllData());
    }
}


function deleteUser(is_operator) {
    return async function(req, res) {

        try {
            // Estrazione id
            const user = await UserModel.findOne({ username: req.params.username }).populate(is_operator ? "operator" : "customer").exec();
            if (!user) { throw error.generate.NOT_FOUND("Utente inesistente"); }
            
            // Cancellazione utenza
            await UserModel.findByIdAndDelete(user._id);

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

        return res.sendStatus(utils.http.NO_CONTENT);
    }
}

// Ricerca di tutti i permessi
async function getPermissions(req, res) {
    try {
        let permissions = await PermissionModel.find().exec();
        permissions = permissions.map((permission) => permission.getData());
        
        return res.status(utils.http.OK).json(permissions);
    } catch (err) {
        return error.response(err, res);
    }
}

// Ricerca dei dati di un permesso
async function searchPermissionByName(req, res) {
    try {
        const permission = await PermissionModel.findOne({ name: req.params.permission_name }).exec();
        if (!permission) { throw error.generate.NOT_FOUND("Permesso inesistente"); }
        
        return res.status(utils.http.OK).json(permission.getData());
    } catch (err) {
        return error.response(err, res);
    }
}


module.exports = {
    insertOperator: insertOperator,
    insertCustomer: insertCustomer,
    searchUser: searchUser,
    searchUserProfile: searchUserProfile,
    updateUser: updateUser,
    deleteUser: deleteUser,
    getPermissions: getPermissions,
    getPermissionByName: searchPermissionByName
}