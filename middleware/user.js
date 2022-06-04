const validator = require('express-validator');
const utils = require("./utils");
const OperatorModel = require("../models/auth/operator");
const UserModel = require("../models/auth/user");

const validateWorkingTimeRequired = function() {
    let out = [ validator.body("working_time").exists() ];

    for (const week of ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]) {
        out.push( validator.body(`working_time.${week}`).exists() );
        out.push( validator.body(`working_time.${week}.*.time.start`).optional().isISO8601().toDate() );
        out.push( validator.body(`working_time.${week}.*.time.end`).optional().isISO8601().toDate() );
        out.push( validator.body(`working_time.${week}.*.hub_id`).optional().isMongoId() );
    }

    return out;
}();

const validateWorkingTimeOptional = function () {
    let out = [validator.body("working_time").optional()];

    for (const week of ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]) {
        out.push( validator.body(`working_time.${week}`).optional() );
        out.push( validator.body(`working_time.${week}.*.time`).optional() );
        out.push( validator.body(`working_time.${week}.*.time.start`).optional().isISO8601().toDate() );
        out.push( validator.body(`working_time.${week}.*.time.end`).optional().isISO8601().toDate() );
        out.push( validator.body(`working_time.${week}.*.hub_id`).optional().isMongoId() );
    }

    return out;
}();

const validateAbsenceTime = function () {
    let out = [validator.body("absence_time").optional()];

    for (const week of ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]) {
        out.push( validator.body(`working_time.${week}`).optional() );
        out.push( validator.body(`working_time.${week}.*.time`).optional() );
        out.push( validator.body(`working_time.${week}.*.time.start`).optional().isISO8601().toDate() );
        out.push( validator.body(`working_time.${week}.*.time.end`).optional().isISO8601().toDate() );
    }

    return out;
}();

async function isUsernameAvailable(username) {
    const operator = await OperatorModel.findOne({ username: username }, { _id: 1 });
    if (operator) { return false; }

    const user = await UserModel.findOne({ username: username }, { _id: 1 });
    if (user) { return false; }

    return true;
}

async function isEmailAvailable(email) {
    const operator = await OperatorModel.findOne({ email: email }, { _id: 1 });
    if (operator) { return false; }

    const user = await UserModel.findOne({ email: email }, { _id: 1 });
    if (user) { return false; }

    return true;
}

const validateInsertCustomer = [
    validator.body("username").exists().trim().escape().custom(async function(username) { 
        if (!await isUsernameAvailable(username)) { throw new Error("Username non disponibile"); }
        return true;
    }),
    validator.body("password").exists().isStrongPassword(),
    validator.body("email").exists().isEmail().normalizeEmail().custom(async function (email) {
        if (!await isEmailAvailable(email)) { throw new Error("Email non disponibile"); }
        return true;
    }),
    validator.body("name").exists().trim().escape(),
    validator.body("surname").exists().trim().escape(),
    validator.body("gender").optional().trim().isIn(["M", "F", "Non-binary", "Altro"]),
    validator.body("address.city").optional().trim().escape(),
    validator.body("address.street").optional().trim().escape(),
    validator.body("address.number").optional().trim().escape(),
    validator.body("address.postal_code").optional().isPostalCode("any"),
    validator.body("phone").optional().isMobilePhone("any"),
    utils.errorHandler
];

const validateInsertOperator = [
    validator.body("username").exists().trim().escape().custom(async function (username) {
        if (!await isUsernameAvailable(username)) { throw new Error("Username non disponibile"); }
        return true;
    }),
    validator.body("password").exists().isStrongPassword(),
    validator.body("email").exists().isEmail().normalizeEmail().custom(async function (email) {
        if (!await isEmailAvailable(email)) { throw new Error("Email non disponibile"); }
        return true;
    }),
    validator.body("name").exists().trim().escape(),
    validator.body("surname").exists().trim().escape(),
    validator.body("gender").optional().trim().isIn(["M", "F", "Non-binary", "Altro"]),
    validator.body("phone").optional().isMobilePhone("any"),
    validator.body("role_id").exists().isMongoId(),
    validator.body("permission").optional(),
    validateWorkingTimeRequired,
    utils.errorHandler
];

const validateSearchUser = [
    validator.param("username").exists().trim().escape(),
    utils.errorHandler
];

const validateUpdateCustomer = [
    validator.param("username").exists().trim().escape(),
    validator.body("password").optional().isStrongPassword(),
    validator.body("email").optional().isEmail().normalizeEmail().custom(async function (email) {
        if (!await isEmailAvailable(email)) { throw new Error("Email non disponibile"); }
        return true;
    }),
    validator.body("name").optional().trim().escape(),
    validator.body("surname").optional().trim().escape(),
    validator.body("gender").optional().trim().isIn(["M", "F", "Non-binary", "Altro"]),
    validator.body("address.city").optional().trim().escape(),
    validator.body("address.street").optional().trim().escape(),
    validator.body("address.number").optional().trim().escape(),
    validator.body("address.postal_code").optional().isPostalCode("any"),
    validator.body("phone").optional().isMobilePhone("any"),
    validator.body("role_id").optional().isMongoId(),
    validator.body("permission").optional(),
    utils.errorHandler
];

const validateUpdateOperator = [
    validator.param("username").exists().trim().escape(),
    validator.body("password").optional().isStrongPassword(),
    validator.body("email").optional().isEmail().normalizeEmail().custom(async function (email) {
        if (!await isEmailAvailable(email)) { throw new Error("Email non disponibile"); }
        return true;
    }),
    validator.body("name").optional().trim().escape(),
    validator.body("surname").optional().trim().escape(),
    validator.body("gender").optional().trim().isIn(["M", "F", "Non-binary", "Altro"]),
    validator.body("phone").optional().isMobilePhone("any"),
    validator.body("role_id").optional().isMongoId(),
    validator.body("permission").optional(),
    validateWorkingTimeOptional,
    validateAbsenceTime,
    utils.errorHandler
];

const validateDeleteUser = [
    validator.param("username").exists().trim().escape(),
    utils.errorHandler
];

module.exports = {
    validateInsertCustomer : validateInsertCustomer,
    validateInsertOperator : validateInsertOperator,
    validateSearchUser : validateSearchUser,
    validateUpdateCustomer : validateUpdateCustomer,
    validateUpdateOperator : validateUpdateOperator,
    validateDeleteUser : validateDeleteUser
}