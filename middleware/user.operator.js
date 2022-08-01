const utils = require("./utils");
const user_validator = require("./validators/user");
const operator_validator = require("./validators/user.operator");
const validator = require("express-validator");
const { REQUIRED, OPTIONAL } = require("./validators/utils");

const validateInsertAbsenceTime = [
    user_validator.validateUsername("param", REQUIRED),
    operator_validator.validateAbsenceTime("body", REQUIRED),
    utils.validatorErrorHandler,
    user_validator.verifyUserOwnership("params")
];

const validategetAbsenceTime = [
    user_validator.validateUsername("param", REQUIRED),
    utils.validatorErrorHandler,
    user_validator.verifyUserOwnership("params")
];

const validateDeleteAbsenceTimeByIndex = [
    user_validator.validateUsername("param", REQUIRED),
    operator_validator.validateAbsenceTimeIndex("param", REQUIRED),
    utils.validatorErrorHandler,
    user_validator.verifyUserOwnership("params")
];

const validategetWorkingTime = [
    user_validator.validateUsername("param", REQUIRED),
    utils.validatorErrorHandler,
    user_validator.verifyUserOwnership("params")
];

const validateUpdateWorkingTime = [
    user_validator.validateUsername("param", REQUIRED),
    operator_validator.validateWorkingTime("body", OPTIONAL),
    utils.validatorErrorHandler,
    user_validator.verifyUserOwnership("params")
];

module.exports = {
    validateInsertAbsenceTime: validateInsertAbsenceTime,
    validategetAbsenceTime: validategetAbsenceTime,
    validateDeleteAbsenceTimeByIndex: validateDeleteAbsenceTimeByIndex,
    validategetWorkingTime: validategetWorkingTime,
    validateUpdateWorkingTime: validateUpdateWorkingTime
}