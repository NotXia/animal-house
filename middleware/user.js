// const validator = require('express-validator');
const utils = require("./utils");
const user_validator = require("./validators/user");
const operator_validator = require("./validators/user.operator");
const customer_validator = require("./validators/user.customer");
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
            permissions: source.permissions,
            enabled: source.enabled,
            picture: source.picture
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
            services_id: source.services_id,
            working_time: source.working_time
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
        user_validator.validateUsername(source, REQUIRED),
        user_validator.validatePassword(source, REQUIRED),
        user_validator.validateEmail(source, REQUIRED),
        user_validator.validateName(source, REQUIRED),
        user_validator.validateSurname(source, REQUIRED),
        user_validator.validateGender(source, OPTIONAL),
        user_validator.validatePhone(source, OPTIONAL),
        user_validator.validateProfilePicture(source, OPTIONAL),
    ];
}

const validateInsertCustomer = [
    validateNewUserData("body"),
    customer_validator.validateAddress("body", REQUIRED),
    utils.validatorErrorHandler,
    groupCustomerData("body")
];

const validateInsertOperator = [
    validateNewUserData("body"),
    user_validator.validatePermissions("body", OPTIONAL),
    operator_validator.validateRole("body", OPTIONAL),
    operator_validator.validateListOfServicesId("body", OPTIONAL),
    operator_validator.validateWorkingTime("body", REQUIRED),
    utils.validatorErrorHandler,
    groupOperatorData("body")
];


const validateSearchUser = [
    user_validator.validateUsername("param", REQUIRED),
    utils.validatorErrorHandler,
    user_validator.verifyUserOwnership("params"),
];

const validateSearchUserProfile = [
    user_validator.validateUsername("param", REQUIRED),
    utils.validatorErrorHandler
];


function validateUpdateUserData(source) {
    return [
        user_validator.validatePassword(source, OPTIONAL),
        user_validator.validateEmail(source, OPTIONAL),
        user_validator.validateName(source, OPTIONAL),
        user_validator.validateSurname(source, OPTIONAL),
        user_validator.validateGender(source, OPTIONAL),
        user_validator.validatePhone(source, OPTIONAL),
        user_validator.validatePermissions(source, OPTIONAL),
        user_validator.validateEnabled(source, OPTIONAL),
        user_validator.validateProfilePicture(source, OPTIONAL),
    ];
}

const validateUpdateCustomer = [
    user_validator.validateUsername("param", REQUIRED),
    validateUpdateUserData("body"),
    customer_validator.validateAddress("body", OPTIONAL),
    utils.validatorErrorHandler,
    user_validator.verifyUserOwnership("params"),
    function (req, _, next) {
        // Solo uno superuser può modificare i permessi / flag enabled
        if (req.body.permission && !req.auth.superuser) { throw new error.generate.FORBIDDEN("Non puoi modificare i tuoi permessi"); }
        if (req.body.enabled && !req.auth.superuser) { throw new error.generate.FORBIDDEN("Non puoi abilitare/disabilitare la tua utenza"); }
        
        next();
    },
    groupCustomerData("body")
];

const validateUpdateOperator = [
    user_validator.validateUsername("param", REQUIRED),
    validateUpdateUserData("body"),
    operator_validator.validateRole("body", OPTIONAL),
    operator_validator.validateListOfServicesId("body", OPTIONAL),
    operator_validator.validateWorkingTime("body", OPTIONAL),
    utils.validatorErrorHandler,
    user_validator.verifyUserOwnership("params"),
    function (req, _, next) {
        // Solo uno superuser può modificare i permessi / flag enabled
        if (req.body.permission && !req.auth.superuser) { throw new error.generate.FORBIDDEN("Non puoi modificare i tuoi permessi"); } 
        if (req.body.enabled && !req.auth.superuser) { throw new error.generate.FORBIDDEN("Non puoi abilitare/disabilitare la tua utenza"); }
        
        next();
    },
    groupOperatorData("body")
];


const validateDeleteUser = [
    user_validator.validateUsername("param", REQUIRED),
    utils.validatorErrorHandler,
    user_validator.verifyUserOwnership("params")
];

const validateSearchPermissionByName = [
    user_validator.validatePermissionName("param", REQUIRED, "permission_name"),
    utils.validatorErrorHandler
];

const validateSendVerificationMail = [
    user_validator.validateUsername("param", REQUIRED),
    utils.validatorErrorHandler,
];


const validateUsernameAvailability = [
    user_validator.validateUsername("param", REQUIRED),
    utils.validatorErrorHandler,
];

const validateEmailAvailability = [
    user_validator.validateEmail("param", REQUIRED, "email"),
    utils.validatorErrorHandler,
];


module.exports = {
    validateInsertCustomer : validateInsertCustomer,
    validateInsertOperator : validateInsertOperator,
    validateSearchUser : validateSearchUser,
    validateUpdateCustomer : validateUpdateCustomer,
    validateUpdateOperator : validateUpdateOperator,
    validateDeleteUser : validateDeleteUser,
    validateSearchUserProfile : validateSearchUserProfile,
    validateSearchPermissionByName: validateSearchPermissionByName,
    validateSendVerificationMail: validateSendVerificationMail,
    validateUsernameAvailability: validateUsernameAvailability,
    validateEmailAvailability: validateEmailAvailability
}