// const validator = require('express-validator');
const utils = require("./utils");
const validator = require("./validators/user");
const { REQUIRED, OPTIONAL } = require("./validators/utils");
const error = require("../error_handler");

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
            role: source.role,
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


function validateNewUserData(source) {
    return [
        validator.validateUsername(source, REQUIRED),
        validator.validatePassword(source, REQUIRED),
        validator.validateEmail(source, REQUIRED),
        validator.validateName(source, REQUIRED),
        validator.validateSurname(source, REQUIRED),
        validator.validateGender(source, OPTIONAL),
        validator.validatePhone(source, OPTIONAL),
    ];
}

const validateInsertCustomer = [
    validateNewUserData("body"),
    validator.validateAddress("body", REQUIRED),
    utils.validatorErrorHandler,
    groupCustomerData("body")
];

const validateInsertOperator = [
    validateNewUserData("body"),
    validator.validatePermission("body", OPTIONAL),
    validator.validateRole("body", OPTIONAL),
    validator.validateListOfServices("body", OPTIONAL),
    utils.validatorErrorHandler,
    groupOperatorData("body")
];


const validateSearchUser = [
    validator.validateUsername("param", REQUIRED),
    utils.validatorErrorHandler,
    validator.verifyUserOwnership("params"),
];

const validateSearchUserProfile = [
    validator.validateUsername("param", REQUIRED),
    utils.validatorErrorHandler
];


function validateUpdateUserData(source) {
    return [
        validator.validatePassword(source, OPTIONAL),
        validator.validateEmail(source, OPTIONAL),
        validator.validateName(source, OPTIONAL),
        validator.validateSurname(source, OPTIONAL),
        validator.validateGender(source, OPTIONAL),
        validator.validatePhone(source, OPTIONAL),
        validator.validatePermission(source, OPTIONAL),
    ];
}

const validateUpdateCustomer = [
    validator.validateUsername("param", REQUIRED),
    validateUpdateUserData("body"),
    validator.validateAddress("body", OPTIONAL),
    utils.validatorErrorHandler,
    validator.verifyUserOwnership("params"),
    function (req, _, next) {
        if (req.body.permission && !req.auth.superuser) { throw new error.generate.FORBIDDEN("Non puoi modificare i tuoi permessi"); } // Solo uno superuser può modificare i permessi
        next();
    },
    groupCustomerData("body")
];

const validateUpdateOperator = [
    validator.validateUsername("param", REQUIRED),
    validateUpdateUserData("body"),
    validator.validateRole("body", OPTIONAL),
    validator.validateListOfServices("body", OPTIONAL),
    utils.validatorErrorHandler,
    validator.verifyUserOwnership("params"),
    function (req, _, next) {
        if (req.body.permission && !req.auth.superuser) { throw new error.generate.FORBIDDEN("Non puoi modificare i tuoi permessi"); } // Solo uno superuser può modificare i permessi
        next();
    },
    groupOperatorData("body")
];


const validateDeleteUser = [
    validator.validateUsername("param", REQUIRED),
    utils.validatorErrorHandler,
    validator.verifyUserOwnership("params")
];


module.exports = {
    validateInsertCustomer : validateInsertCustomer,
    validateInsertOperator : validateInsertOperator,
    validateSearchUser : validateSearchUser,
    validateUpdateCustomer : validateUpdateCustomer,
    validateUpdateOperator : validateUpdateOperator,
    validateDeleteUser : validateDeleteUser,
    validateSearchUserProfile : validateSearchUserProfile
}