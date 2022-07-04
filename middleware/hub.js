const validator = require('express-validator');
const utils = require("./utils");
const error = require("../error_handler");

/*
    Validatori dei singoli campi
*/

function validateEmail(source)      { return source("email").isEmail().withMessage("Formato non valido").normalizeEmail(); }
function validatePhone(source)      { return source("phone").isMobilePhone("any").withMessage("Formato non valido"); }
function validateAddressExists(source) {
    return [
        source("address.city").exists().withMessage("Valore mancante").trim().escape(),
        source("address.street").exists().withMessage("Valore mancante").trim().escape(),
        source("address.number").exists().withMessage("Valore mancante").trim().escape(),
        source("address.postal_code").exists().isPostalCode("any").withMessage("Formato non valido"),
    ];
}
function validateOpeningTimeExists(source) {
    let out = [ source("working_time").exists().withMessage("Valore mancante") ];

    for (const week of ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]) {
        out.push( source(`working_time.${week}`).exists().withMessage("Valore mancante") );
        out.push( source(`working_time.${week}.*.time.start`).optional().isISO8601().withMessage("Formato non valido").toDate() );
        out.push( source(`working_time.${week}.*.time.end`).optional().isISO8601().withMessage("Formato non valido").toDate() );
        out.push( source(`working_time.${week}.*.hub_id`).optional().isMongoId().withMessage("Formato non valido") );
    }

    return out;
};

const validateInsertHub = [
    validator.body("name").exists().isString().withMessage("Il campo 'name' deve essere una stringa"),
    validateAddressExists(validator.body),
    validateOpeningTimeExists(validator.body),
    validatePhone(validator.body).optional(),
    validateEmail(validator.body).exists().withMessage("Valore mancante"),
    utils.validatorErrorHandler
];

module.exports = {
    validateInsertHub: validateInsertHub   
}