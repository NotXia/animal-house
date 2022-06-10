const validator = require('express-validator');
const utils = require("./utils");

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
    let out = [ validator.body("working_time").optional() ];

    for (const week of ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]) {
        out.push( validator.body(`working_time.${week}`).optional() );
        out.push( validator.body(`working_time.${week}.*.time`).optional() );
        out.push( validator.body(`working_time.${week}.*.time.start`).optional().isISO8601().toDate() );
        out.push( validator.body(`working_time.${week}.*.time.end`).optional().isISO8601().toDate() );
        out.push( validator.body(`working_time.${week}.*.hub_id`).optional().isMongoId() );
    }

    return out;
}();

const validateAbsenceTimeOptional = function () {
    let out = [ validator.body("absence_time").optional() ];

    for (const week of ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]) {
        out.push( validator.body(`absence_time.${week}`).optional() );
        out.push( validator.body(`absence_time.${week}.*.time`).optional() );
        out.push( validator.body(`absence_time.${week}.*.time.start`).optional().isISO8601().toDate() );
        out.push( validator.body(`absence_time.${week}.*.time.end`).optional().isISO8601().toDate() );
    }

    return out;
}();

/* Raggruppa in un unico Object tutti i campi relativi agli utenti */
function groupUserData(source) {
    return Object.fromEntries(Object.entries(
        {
            username: source.username,
            password: source.password,
            email: source.email,
            name: source.name,
            surname: source.surname,
            gender: source.gender,
            phone: source.phone,
            permission: source.permission
        }
    ).filter(([_, v]) => v != null)); 
}
/* Raggruppa in un unico Object tutti i campi relativi ai clienti */
function groupCustomerData(source) {
    return Object.fromEntries(Object.entries(
        {
            address: source.address
        }
    ).filter(([_, v]) => v != null)); 
}
/* Raggruppa in un unico Object tutti i campi relativi agli operatori */
function groupOperatorData(source) {
    return Object.fromEntries(Object.entries(
        {
            role_id: source.role_id,
            working_time: source.working_time,
            absence_time: source.absence_time
        }
    ).filter(([_, v]) => v != null)); 
}

const validateInsertCustomer = [
    validator.body("username").exists().trim().escape(),
    validator.body("password").exists().isStrongPassword(),
    validator.body("email").exists().isEmail().normalizeEmail(),
    validator.body("name").exists().trim().escape(),
    validator.body("surname").exists().trim().escape(),
    validator.body("gender").optional().trim().isIn(["M", "F", "Non-binary", "Altro"]),
    validator.body("phone").optional().isMobilePhone("any"),
    validator.body("address.city").exists().trim().escape(),
    validator.body("address.street").exists().trim().escape(),
    validator.body("address.number").exists().trim().escape(),
    validator.body("address.postal_code").exists().isPostalCode("any"),
    utils.errorHandler,
    function (req, res, next) {
        res.locals.user = groupUserData(req.body);
        res.locals.customer = groupCustomerData(req.body);
        next();
    }
];

const validateInsertOperator = [
    validator.body("username").exists().trim().escape(),
    validator.body("password").exists().isStrongPassword(),
    validator.body("email").exists().isEmail().normalizeEmail(),
    validator.body("name").exists().trim().escape(),
    validator.body("surname").exists().trim().escape(),
    validator.body("permission").exists(),
    validator.body("gender").optional().trim().isIn(["M", "F", "Non-binary", "Altro"]),
    validator.body("phone").optional().isMobilePhone("any"),
    validator.body("role_id").exists().isMongoId(),
    validateWorkingTimeRequired,
    validateAbsenceTimeOptional,
    utils.errorHandler,
    function (req, res, next) {
        res.locals.user = groupUserData(req.body);
        res.locals.operator = groupOperatorData(req.body);

        next();
    }
];

const validateSearchUser = [
    validator.param("username").exists().trim().escape(),
    utils.errorHandler
];

const validateUpdateCustomer = [
    validator.param("username").exists().trim().escape(),
    validator.body("password").optional().isStrongPassword(),
    validator.body("email").optional().isEmail().normalizeEmail(),
    validator.body("name").optional().trim().escape(),
    validator.body("surname").optional().trim().escape(),
    validator.body("gender").optional().trim().isIn(["M", "F", "Non-binary", "Altro"]),
    validator.body("phone").optional().isMobilePhone("any"),
    validator.body("permission").optional(),
    validator.body("address.city").optional().trim().escape(),
    validator.body("address.street").optional().trim().escape(),
    validator.body("address.number").optional().trim().escape(),
    validator.body("address.postal_code").optional().isPostalCode("any"),
    utils.errorHandler,
    function (req, res, next) {
        res.locals.user = groupUserData(req.body);
        res.locals.customer = groupCustomerData(req.body);
        next();
    }
];

const validateUpdateOperator = [
    validator.param("username").exists().trim().escape(),
    validator.body("password").optional().isStrongPassword(),
    validator.body("email").optional().isEmail().normalizeEmail(),
    validator.body("name").optional().trim().escape(),
    validator.body("surname").optional().trim().escape(),
    validator.body("gender").optional().trim().isIn(["M", "F", "Non-binary", "Altro"]),
    validator.body("phone").optional().isMobilePhone("any"),
    validator.body("permission").optional(),
    validator.body("role_id").optional().isMongoId(),
    validateWorkingTimeOptional,
    validateAbsenceTimeOptional,
    utils.errorHandler,
    function (req, res, next) {
        res.locals.user = groupUserData(req.body);
        res.locals.operator = groupOperatorData(req.body);
        next();
    }
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