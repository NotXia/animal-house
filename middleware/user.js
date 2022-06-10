const validator = require('express-validator');
const utils = require("./utils");

const validateWorkingTimeRequired = function() {
    let out = [ validator.body("operator.working_time").exists() ];

    for (const week of ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]) {
        out.push( validator.body(`operator.working_time.${week}`).exists() );
        out.push( validator.body(`operator.working_time.${week}.*.time.start`).optional().isISO8601().toDate() );
        out.push( validator.body(`operator.working_time.${week}.*.time.end`).optional().isISO8601().toDate() );
        out.push( validator.body(`operator.working_time.${week}.*.hub_id`).optional().isMongoId() );
    }

    return out;
}();

const validateWorkingTimeOptional = function () {
    let out = [ validator.body("operator.working_time").optional() ];

    for (const week of ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]) {
        out.push( validator.body(`operator.working_time.${week}`).optional() );
        out.push( validator.body(`operator.working_time.${week}.*.time`).optional() );
        out.push( validator.body(`operator.working_time.${week}.*.time.start`).optional().isISO8601().toDate() );
        out.push( validator.body(`operator.working_time.${week}.*.time.end`).optional().isISO8601().toDate() );
        out.push( validator.body(`operator.working_time.${week}.*.hub_id`).optional().isMongoId() );
    }

    return out;
}();

const validateAbsenceTime = function () {
    let out = [ validator.body("operator.absence_time").optional() ];

    for (const week of ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]) {
        out.push( validator.body(`operator.absence_time.${week}`).optional() );
        out.push( validator.body(`operator.absence_time.${week}.*.time`).optional() );
        out.push( validator.body(`operator.absence_time.${week}.*.time.start`).optional().isISO8601().toDate() );
        out.push( validator.body(`operator.absence_time.${week}.*.time.end`).optional().isISO8601().toDate() );
    }

    return out;
}();


const validateInsertCustomer = [
    validator.body("user.username").exists().trim().escape(),
    validator.body("user.password").exists().isStrongPassword(),
    validator.body("user.email").exists().isEmail().normalizeEmail(),
    validator.body("user.name").exists().trim().escape(),
    validator.body("user.surname").exists().trim().escape(),
    validator.body("user.gender").optional().trim().isIn(["M", "F", "Non-binary", "Altro"]),
    validator.body("user.phone").optional().isMobilePhone("any"),
    validator.body("customer.address.city").optional().trim().escape(),
    validator.body("customer.address.street").optional().trim().escape(),
    validator.body("customer.address.number").optional().trim().escape(),
    validator.body("customer.address.postal_code").optional().isPostalCode("any"),
    utils.errorHandler
];

const validateInsertOperator = [
    validator.body("user.username").exists().trim().escape(),
    validator.body("user.password").exists().isStrongPassword(),
    validator.body("user.email").exists().isEmail().normalizeEmail(),
    validator.body("user.name").exists().trim().escape(),
    validator.body("user.surname").exists().trim().escape(),
    validator.body("user.permission").exists(),
    validator.body("user.gender").optional().trim().isIn(["M", "F", "Non-binary", "Altro"]),
    validator.body("user.phone").optional().isMobilePhone("any"),
    validator.body("operator.role_id").exists().isMongoId(),
    validateWorkingTimeRequired,
    utils.errorHandler
];

const validateSearchUser = [
    validator.param("username").exists().trim().escape(),
    utils.errorHandler
];

const validateUpdateCustomer = [
    validator.param("username").exists().trim().escape(),
    validator.body("user.password").optional().isStrongPassword(),
    validator.body("user.email").optional().isEmail().normalizeEmail(),
    validator.body("user.name").optional().trim().escape(),
    validator.body("user.surname").optional().trim().escape(),
    validator.body("user.gender").optional().trim().isIn(["M", "F", "Non-binary", "Altro"]),
    validator.body("user.phone").optional().isMobilePhone("any"),
    validator.body("user.permission").optional(),
    validator.body("customer.address.city").optional().trim().escape(),
    validator.body("customer.address.street").optional().trim().escape(),
    validator.body("customer.address.number").optional().trim().escape(),
    validator.body("customer.address.postal_code").optional().isPostalCode("any"),
    utils.errorHandler
];

const validateUpdateOperator = [
    validator.param("username").exists().trim().escape(),
    validator.body("user.password").optional().isStrongPassword(),
    validator.body("user.email").optional().isEmail().normalizeEmail(),
    validator.body("user.name").optional().trim().escape(),
    validator.body("user.surname").optional().trim().escape(),
    validator.body("user.gender").optional().trim().isIn(["M", "F", "Non-binary", "Altro"]),
    validator.body("user.phone").optional().isMobilePhone("any"),
    validator.body("user.permission").optional(),
    validator.body("operator.role_id").optional().isMongoId(),
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