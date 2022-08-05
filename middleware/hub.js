const utils = require("./utils");
const { REQUIRED, OPTIONAL } = require("./validators/utils");
const hub_validator = require("./validators/hub");
const validator = require("express-validator");

const validateInsertHub = [
    hub_validator.validateCode("body", REQUIRED),
    hub_validator.validateName("body", REQUIRED),
    hub_validator.validateAddress("body", REQUIRED),
    hub_validator.validateCoordinates("body", REQUIRED),
    hub_validator.validateOpeningTime("body", REQUIRED),
    hub_validator.validatePhone("body", OPTIONAL),
    hub_validator.validateEmail("body", OPTIONAL),
    utils.validatorErrorHandler
];

const validateGetHubs = [
    validator.query("page_size").exists().isInt({ min: 1 }).withMessage("Il valore deve essere un intero che inizia da 1"),
    validator.query("page_number").exists().isInt({ min: 0 }).withMessage("Il valore deve essere un intero che inizia da 0"),
    validator.query("lat").if(validator.query('lon').exists()).exists().withMessage("Valore mancante").bail().isFloat().withMessage("Formato non valido"),
    validator.query("lon").if(validator.query('lat').exists()).exists().withMessage("Valore mancante").bail().isFloat().withMessage("Formato non valido"),
    utils.validatorErrorHandler
]

const validateGetHubByCode = [
    hub_validator.validateCode("param", REQUIRED),
    utils.validatorErrorHandler
];

const validateGetServicesOfHub = [
    hub_validator.validateCode("param", REQUIRED),
    utils.validatorErrorHandler
];

const validateUpdateHub = [
    hub_validator.validateCode("param", REQUIRED),
    hub_validator.validateName("body", OPTIONAL),
    hub_validator.validateAddress("body", OPTIONAL),
    hub_validator.validateCoordinates("body", OPTIONAL),
    hub_validator.validateOpeningTime("body", OPTIONAL),
    hub_validator.validatePhone("body", OPTIONAL),
    hub_validator.validateEmail("body", OPTIONAL),
    utils.validatorErrorHandler
];

const validateDeleteHub = [
    hub_validator.validateCode("param", REQUIRED),
    utils.validatorErrorHandler
];

module.exports = {
    validateInsertHub: validateInsertHub,
    validateGetHubs: validateGetHubs,
    validateGetHubByCode: validateGetHubByCode,
    validateGetServicesOfHub: validateGetServicesOfHub,
    validateUpdateHub: validateUpdateHub,
    validateDeleteHub: validateDeleteHub
}