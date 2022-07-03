const validator = require('express-validator');
const utils = require("../utils");

function validateName(source) { return source("name").trim().escape(); }
function validateIcon(source) { return source("icon").isBase64().withMessage("Formato non valido"); }

const validateInsertTopic = [
    validateName(validator.body).exists().withMessage("Valore mancante"),
    validateIcon(validator.body).optional(),
    utils.validatorErrorHandler
];

const validateUpdateTopic = [
    validator.param("topic").exists().withMessage("Valore mancante").trim().escape(),
    validateName(validator.body).optional(),
    validateIcon(validator.body).optional(),
    utils.validatorErrorHandler
];

const validateDeleteTopic = [
    validator.param("topic").exists().withMessage("Valore mancante").trim().escape(),
    utils.validatorErrorHandler
];

module.exports = {
    validateInsertTopic: validateInsertTopic,
    validateUpdateTopic: validateUpdateTopic,
    validateDeleteTopic: validateDeleteTopic
}