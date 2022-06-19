const validator = require('express-validator');
const utils = require("./utils");
const { error } = require("../utilities");

/*
    Validatori dei singoli campi
*/

function validateUsername(source)   { return source("username").trim().escape(); }
function validatePassword(source)   { return source("password").isStrongPassword().withMessage("La password non è sufficientemente sicura"); }
function validateEmail(source)      { return source("email").isEmail().withMessage("Formato non valido").normalizeEmail(); }
function validateName(source)       { return source("name").trim().escape(); }
function validateSurname(source)    { return source("surname").trim().escape(); }
function validateGender(source)     { return source("gender").trim().isIn(["M", "F", "Non-binary", "Altro"]).withMessage("Formato non valido"); }
function validatePhone(source)      { return source("phone").isMobilePhone("any").withMessage("Formato non valido"); }
function validatePermission(source) { return source("permission"); }

function validateRole_id(source) { return source("role_id").isMongoId().withMessage("Formato non valido"); }
function validateWorkingTimeExists(source) {
    let out = [ source("working_time").exists().withMessage("Valore mancante") ];

    for (const week of ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]) {
        out.push( source(`working_time.${week}`).exists().withMessage("Valore mancante") );
        out.push( source(`working_time.${week}.*.time.start`).optional().isISO8601().withMessage("Formato non valido").toDate() );
        out.push( source(`working_time.${week}.*.time.end`).optional().isISO8601().withMessage("Formato non valido").toDate() );
        out.push( source(`working_time.${week}.*.hub_id`).optional().isMongoId().withMessage("Formato non valido") );
    }

    return out;
};
function validateWorkingTimeOptional(source) {
    let out = [ source("working_time").optional() ];

    for (const week of ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]) {
        out.push( source(`working_time.${week}`).optional() );
        out.push( source(`working_time.${week}.*.time`).optional() );
        out.push( source(`working_time.${week}.*.time.start`).optional().isISO8601().withMessage("Formato non valido").toDate() );
        out.push( source(`working_time.${week}.*.time.end`).optional().isISO8601().withMessage("Formato non valido").toDate() );
        out.push( source(`working_time.${week}.*.hub_id`).optional().isMongoId().withMessage("Formato non valido") );
    }

    return out;
};
function validateAbsenceTimeOptional(source) {
    let out = [ source("absence_time").optional() ];

    for (const week of ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]) {
        out.push( source(`absence_time.${week}`).optional() );
        out.push( source(`absence_time.${week}.*.time`).optional() );
        out.push( source(`absence_time.${week}.*.time.start`).optional().isISO8601().withMessage("Formato non valido").toDate() );
        out.push( source(`absence_time.${week}.*.time.end`).optional().isISO8601().withMessage("Formato non valido").toDate() );
    }

    return out;
};

function validateAddressExists(source) {
    return [
        source("address.city").exists().withMessage("Valore mancante").trim().escape(),
        source("address.street").exists().withMessage("Valore mancante").trim().escape(),
        source("address.number").exists().withMessage("Valore mancante").trim().escape(),
        source("address.postal_code").exists().isPostalCode("any").withMessage("Formato non valido"),
    ];
}
function validateAddressOptional(source) {
    return [
        source("address.city").optional().trim().escape(),
        source("address.street").optional().trim().escape(),
        source("address.number").optional().trim().escape(),
        source("address.postal_code").optional().isPostalCode("any").withMessage("Formato non valido"),
    ];
}

/* Raggruppa in un unico Object tutti i campi relativi agli utenti */
function _getUserData(source) {
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
function _getCustomerData(source) {
    return Object.fromEntries(Object.entries(
        {
            address: source.address
        }
    ).filter(([_, v]) => v != null)); 
}
/* Raggruppa in un unico Object tutti i campi relativi agli operatori */
function _getOperatorData(source) {
    return Object.fromEntries(Object.entries(
        {
            role_id: source.role_id,
            working_time: source.working_time,
            absence_time: source.absence_time
        }
    ).filter(([_, v]) => v != null)); 
}

/**
 * Estrae i dati di un cliente e li raggruppa in res.locals
 */
function groupCustomerData(source) {
    return function (req, res, next) {
        res.locals.user = _getUserData(req[source]);
        res.locals.customer = _getCustomerData(req[source]);
        next();
    }
}

/**
 * Estrae i dati di un operatore e li raggruppa in res.locals
 */
function groupOperatorData(source) {
    return function (req, res, next) {
        res.locals.user = _getUserData(req[source]);
        res.locals.operator = _getOperatorData(req[source]);
        next();
    }
}

/**
 * Verifica i permessi per effettuare operazioni sull'oggetto
 */
function verifyUserOwnership(source) {
    return function(req, res, next) {
        if (req.auth.superuser || req.auth.username === req[source].username) {
            return next();
        }
        else {
            return next(error.FORBIDDEN("Non sei il proprietario"));
        }
    }
}


function validateNewUserData(source) {
    return [
        validateUsername(source).exists().withMessage("Valore mancante"),
        validatePassword(source).exists().withMessage("Valore mancante"),
        validateEmail(source).exists().withMessage("Valore mancante"),
        validateName(source).exists().withMessage("Valore mancante"),
        validateSurname(source).exists(),
        validateGender(source).optional(),
        validatePhone(source).optional(),
        validatePermission(source).optional(),
    ];
}

const validateInsertCustomer = [
    validateNewUserData(validator.body),
    validateAddressExists(validator.body),
    utils.validatorErrorHandler,
    groupCustomerData("body")
];

const validateInsertOperator = [
    validateNewUserData(validator.body),
    validatePermission(validator.body).exists().withMessage("Valore mancante"),
    validateRole_id(validator.body).exists().withMessage("Valore mancante"),
    validateWorkingTimeExists(validator.body),
    validateAbsenceTimeOptional(validator.body),
    utils.validatorErrorHandler,
    groupOperatorData("body")
];


const validateSearchUser = [
    validateUsername(validator.param).exists().withMessage("Valore mancante"),
    utils.validatorErrorHandler
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
    validateUsername(validator.param).exists().withMessage("Valore mancante"),
    validateUpdateUserData(validator.body),
    validateAddressOptional(validator.body),
    utils.validatorErrorHandler,
    verifyUserOwnership("params"),
    groupCustomerData("body")
];

const validateUpdateOperator = [
    validateUsername(validator.param).exists().withMessage("Valore mancante"),
    validateUpdateUserData(validator.body),
    validateRole_id(validator.body).optional(),
    validateWorkingTimeOptional(validator.body),
    validateAbsenceTimeOptional(validator.body),
    utils.validatorErrorHandler,
    verifyUserOwnership("params"),
    groupOperatorData("body")
];


const validateDeleteUser = [
    validateUsername(validator.param).exists().withMessage("Valore mancante"),
    utils.validatorErrorHandler,
    verifyUserOwnership("params")
];


module.exports = {
    validateInsertCustomer : validateInsertCustomer,
    validateInsertOperator : validateInsertOperator,
    validateSearchUser : validateSearchUser,
    validateUpdateCustomer : validateUpdateCustomer,
    validateUpdateOperator : validateUpdateOperator,
    validateDeleteUser : validateDeleteUser
}