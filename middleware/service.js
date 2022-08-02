const utils = require("./utils");
const { REQUIRED, OPTIONAL } = require("./validators/utils");
const validator = require("./validators/service");

const validateInsertService = [
    validator.validateServiceName("body", REQUIRED),
    validator.validateServiceDescription("body", REQUIRED),
    validator.validateServiceDuration("body", REQUIRED),
    validator.validateServicePrice("body", REQUIRED),
    validator.validateServiceTarget("body", OPTIONAL),
    utils.validatorErrorHandler
];

const validateGetServiceById = [
    validator.validateServiceId("param", REQUIRED),
    utils.validatorErrorHandler
];

const validateUpdateService = [
    validator.validateServiceId("param", REQUIRED),
    validator.validateServiceName("body", OPTIONAL),
    validator.validateServiceDescription("body", OPTIONAL),
    validator.validateServiceDuration("body", OPTIONAL),
    validator.validateServicePrice("body", OPTIONAL),
    validator.validateServiceTarget("body", OPTIONAL),
    utils.validatorErrorHandler
];

const validateDeleteService = [
    validator.validateServiceId("param", REQUIRED),
    utils.validatorErrorHandler
]

module.exports = {
    validateInsertService: validateInsertService,
    validateGetServiceById: validateGetServiceById,
    validateUpdateService: validateUpdateService,
    validateDeleteService: validateDeleteService
}