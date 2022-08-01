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

const validateUpdateService = [
    validator.validateServiceName("param", REQUIRED),
    validator.validateServiceName("body", OPTIONAL),
    validator.validateServiceDescription("body", OPTIONAL),
    validator.validateServiceDuration("body", OPTIONAL),
    utils.validatorErrorHandler
];

module.exports = {
    validateInsertService: validateInsertService,
    validateGetServiceByName: validateGetServiceByName,
    validateUpdateService: validateUpdateService,
    // validateDeleteHub: validateDeleteHub
}