const validator = require('express-validator');
const utils = require("../utils");

function validateName(source, required=false, field_name="name") {
    let validator = source(field_name);
    if (required) { validator.exists().withMessage("Valore mancante"); } else { validator.optional(); }
    return validator.trim().escape();
}
function validateIcon(source, required=false, field_name="icon") {
    let validator = source(field_name);
    if (required) { validator.exists().withMessage("Valore mancante"); } else { validator.optional(); }
    return validator.isBase64().withMessage("Formato non valido");
}

const validateInsertTopic = [
    validateName(validator.body, true),
    validateIcon(validator.body, false),
    utils.validatorErrorHandler
];

const validateUpdateTopic = [
    validateName(validator.param, true, "topic"),
    validateName(validator.body, false),
    validateIcon(validator.body, false),
    utils.validatorErrorHandler
];

const validateDeleteTopic = [
    validateName(validator.param, true, "topic"),
    utils.validatorErrorHandler
];

module.exports = {
    validateInsertTopic: validateInsertTopic,
    validateUpdateTopic: validateUpdateTopic,
    validateDeleteTopic: validateDeleteTopic
}