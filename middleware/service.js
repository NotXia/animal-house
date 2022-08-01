const utils = require("./utils");
const { REQUIRED, OPTIONAL } = require("./validators/utils");
const validator = require("./validators/service");

const validateInsertService = [
    validator.validateServiceName("body", REQUIRED),
    validator.validateServiceDescription("body", REQUIRED),
    validator.validateServiceDuration("body", REQUIRED),
    utils.validatorErrorHandler
];

const validateGetServiceByName = [
    validator.validateServiceName("param", REQUIRED),
    utils.validatorErrorHandler
];

module.exports = {
    validateInsertService: validateInsertService,
    validateGetServiceByName: validateGetServiceByName,
    // validateUpdateHub: validateUpdateHub,
    // validateDeleteHub: validateDeleteHub
}