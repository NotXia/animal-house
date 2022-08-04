const utils = require("./utils");
const user_validator = require("./validators/user");
const operator_validator = require("./validators/user.operator");
const hub_validator = require("./validators/hub");
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

const validateGetAvailabilities = [
    user_validator.validateUsername("param", REQUIRED),
    validator.query("start_date").exists().isISO8601().withMessage("Formato non valido"),
    validator.query("end_date").exists().isISO8601().withMessage("Formato non valido"),
    hub_validator.validateCode("query", OPTIONAL, "hub"),
    validator.query("slot_size").optional().isInt({min: 1}).withMessage("Il valore deve essere almeno 1"),
    utils.validatorErrorHandler,
];

module.exports = {
    validateInsertAbsenceTime: validateInsertAbsenceTime,
    validateGetAbsenceTime: validategetAbsenceTime,
    validateDeleteAbsenceTimeByIndex: validateDeleteAbsenceTimeByIndex,
    validateGetWorkingTime: validategetWorkingTime,
    validateUpdateWorkingTime: validateUpdateWorkingTime,
    validateGetAvailabilities: validateGetAvailabilities
}