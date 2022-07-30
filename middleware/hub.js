const utils = require("./utils");
const { REQUIRED, OPTIONAL } = require("./validators/utils");
const validator = require("./validators/hub");

const validateInsertHub = [
    validator.validateCode("body",REQUIRED),
    validator.validateName("body",REQUIRED),
    validator.validateAddress("body",REQUIRED),
    validator.validateOpeningTime("body",REQUIRED),
    validator.validatePhone("body",OPTIONAL),
    validator.validateEmail("body",OPTIONAL),
    utils.validatorErrorHandler
];

const validateGetHubs = [
    utils.validatorErrorHandler
];

module.exports = {
    validateInsertHub: validateInsertHub,
    validateGetHubs: validateGetHubs
}