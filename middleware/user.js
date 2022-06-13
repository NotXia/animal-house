const validator = require('express-validator');
const utils = require("./utils");

/*
    Validatori dei singoli campi
*/

function validateUsername(source) { return source("username").trim().escape(); }
function validatePassword(source) { return source("password").isStrongPassword(); }
function validateEmail(source) { return source("email").isEmail().normalizeEmail(); }
function validateName(source) { return source("name").trim().escape(); }
function validateSurname(source) { return source("surname").trim().escape(); }
function validateGender(source) { return source("gender").trim().isIn(["M", "F", "Non-binary", "Altro"]); }
function validatePhone(source) { return source("phone").isMobilePhone("any"); }
function validatePermission(source) { return source("permission"); }

function validateRole_id(source) { return source("role_id").isMongoId(); }
function validateWorkingTimeExists(source) {
    let out = [ source("working_time").exists() ];

    for (const week of ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]) {
        out.push( source(`working_time.${week}`).exists() );
        out.push( source(`working_time.${week}.*.time.start`).optional().isISO8601().toDate() );
        out.push( source(`working_time.${week}.*.time.end`).optional().isISO8601().toDate() );
        out.push( source(`working_time.${week}.*.hub_id`).optional().isMongoId() );
    }

    return out;
};
function validateWorkingTimeOptional(source) {
    let out = [ source("working_time").optional() ];

    for (const week of ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]) {
        out.push( source(`working_time.${week}`).optional() );
        out.push( source(`working_time.${week}.*.time`).optional() );
        out.push( source(`working_time.${week}.*.time.start`).optional().isISO8601().toDate() );
        out.push( source(`working_time.${week}.*.time.end`).optional().isISO8601().toDate() );
        out.push( source(`working_time.${week}.*.hub_id`).optional().isMongoId() );
    }

    return out;
};
function validateAbsenceTimeOptional(source) {
    let out = [ source("absence_time").optional() ];

    for (const week of ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]) {
        out.push( source(`absence_time.${week}`).optional() );
        out.push( source(`absence_time.${week}.*.time`).optional() );
        out.push( source(`absence_time.${week}.*.time.start`).optional().isISO8601().toDate() );
        out.push( source(`absence_time.${week}.*.time.end`).optional().isISO8601().toDate() );
    }

    return out;
};

function validateAddressExists(source) {
    return [
        source("address.city").exists().trim().escape(),
        source("address.street").exists().trim().escape(),
        source("address.number").exists().trim().escape(),
        source("address.postal_code").exists().isPostalCode("any"),
    ];
}
function validateAddressOptional(source) {
    return [
        source("address.city").optional().trim().escape(),
        source("address.street").optional().trim().escape(),
        source("address.number").optional().trim().escape(),
        source("address.postal_code").optional().isPostalCode("any"),
    ];
}

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


function verifyUsernameOwnership(source) {
    return function(req, res, next) {
        if (req.auth.superuser || req.auth.username === req[source].username) {
            return next();
        }
        else {
            return res.sendStatus(403);
        }
    }
}


function validateNewUserData(source) {
    return [
        validateUsername(source).exists(),
        validatePassword(source).exists(),
        validateEmail(source).exists(),
        validateName(source).exists(),
        validateSurname(source).exists(),
        validateGender(source).optional(),
        validatePhone(source).optional(),
        validatePermission(source).optional(),
    ];
}

const validateInsertCustomer = [
    validateNewUserData(validator.body),
    validateAddressExists(validator.body),
    utils.errorHandler,
    function (req, res, next) {
        res.locals.user = groupUserData(req.body);
        res.locals.customer = groupCustomerData(req.body);
        next();
    }
];

const validateInsertOperator = [
    validateNewUserData(validator.body),
    validatePermission(validator.body).exists(),
    validateRole_id(validator.body).exists(),
    validateWorkingTimeExists(validator.body),
    validateAbsenceTimeOptional(validator.body),
    utils.errorHandler,
    function (req, res, next) {
        res.locals.user = groupUserData(req.body);
        res.locals.operator = groupOperatorData(req.body);

        next();
    }
];


const validateSearchUser = [
    validateUsername(validator.param).exists(),
    utils.errorHandler
];


function validateUpdateUserData(source) {
    return [
        validatePassword(source).optional(),
        validateEmail(source).optional(),
        validateName(source).optional(),
        validateSurname(source).optional(),
        validateGender(source).optional(),
        validatePhone(source).optional(),
        validatePermission(source).optional(),
    ];
}

const validateUpdateCustomer = [
    validateUsername(validator.param).exists(),
    validateUpdateUserData(validator.body),
    validateAddressOptional(validator.body),
    utils.errorHandler,
    verifyUsernameOwnership("params"),
    function (req, res, next) {
        res.locals.user = groupUserData(req.body);
        res.locals.customer = groupCustomerData(req.body);
        next();
    }
];

const validateUpdateOperator = [
    validateUsername(validator.param).exists(),
    validateUpdateUserData(validator.body),
    validateRole_id(validator.body).optional(),
    validateWorkingTimeOptional(validator.body),
    validateAbsenceTimeOptional(validator.body),
    utils.errorHandler,
    verifyUsernameOwnership("params"),
    function (req, res, next) {
        res.locals.user = groupUserData(req.body);
        res.locals.operator = groupOperatorData(req.body);
        next();
    }
];


const validateDeleteUser = [
    validateUsername(validator.param).exists(),
    utils.errorHandler,
    verifyUsernameOwnership("params")
];


module.exports = {
    validateInsertCustomer : validateInsertCustomer,
    validateInsertOperator : validateInsertOperator,
    validateSearchUser : validateSearchUser,
    validateUpdateCustomer : validateUpdateCustomer,
    validateUpdateOperator : validateUpdateOperator,
    validateDeleteUser : validateDeleteUser
}