const utils = require("./utils");
const { REQUIRED, OPTIONAL } = require("./validators/utils");
const validator = require("express-validator");
const hub_validator = require("./validators/hub");
const service_validator = require("./validators/service");

const validateSearchAvailabilities = [
    validator.query("start_date").exists().withMessage("Valore mancante").isISO8601().withMessage("Formato non valido"),
    validator.query("end_date").exists().withMessage("Valore mancante").isISO8601().withMessage("Formato non valido"),
    hub_validator.validateCode("query", REQUIRED, "hub_code"),
    service_validator.validateServiceId("query", REQUIRED, "service_id"),
    utils.validatorErrorHandler
]

module.exports = {
    validateSearchAvailabilities: validateSearchAvailabilities
}