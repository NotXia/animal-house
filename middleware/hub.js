const utils = require("./utils");
const { REQUIRED, OPTIONAL } = require("./validators/utils");
const validator = require("./validators/hub");

const validateInsertHub = [
    validator.validateCode("body", REQUIRED),
    validator.validateName("body", REQUIRED),
    validator.validateAddress("body", REQUIRED),
    validator.validateOpeningTime("body", REQUIRED),
    validator.validatePhone("body", OPTIONAL),
    validator.validateEmail("body", OPTIONAL),
    utils.validatorErrorHandler
];


const validateGetHubByCode = [
    validator.validateCode("param", REQUIRED),
    utils.validatorErrorHandler
];

const validateUpdateHub = [
    validator.validateCode("param", REQUIRED),
    validator.validateName("body", OPTIONAL),
    validator.validateAddress("body", OPTIONAL),
    validator.validateOpeningTime("body", OPTIONAL),
    validator.validatePhone("body", OPTIONAL),
    validator.validateEmail("body", OPTIONAL),
    utils.validatorErrorHandler
];

const validateDeleteHub = [
    validator.validateCode("param", REQUIRED),
    utils.validatorErrorHandler
];

module.exports = {
    validateInsertHub: validateInsertHub,
    validateGetHubByCode: validateGetHubByCode,
    validateUpdateHub: validateUpdateHub,
    validateDeleteHub: validateDeleteHub
}