const validator = require("express-validator");
const utils = require("./utils");
const error = require("../../error_handler");

module.exports.validateUsername =   (source, required=true, field_name="username") => { return utils.handleRequired(validator[source](field_name), required).notEmpty().withMessage("Valore mancante").trim().escape(); }
module.exports.validatePassword =   (source, required=true, field_name="password") => { return utils.handleRequired(validator[source](field_name), required).isStrongPassword().withMessage("La password non è sufficientemente sicura"); }
module.exports.validateEmail =      (source, required=true, field_name="email") => { return utils.handleRequired(validator[source](field_name), required).isEmail().withMessage("Formato non valido").normalizeEmail(); }
module.exports.validateName =       (source, required=true, field_name="name") => { return utils.handleRequired(validator[source](field_name), required).notEmpty().withMessage("Valore mancante").trim().escape(); }
module.exports.validateSurname =    (source, required=true, field_name="surname") => { return utils.handleRequired(validator[source](field_name), required).notEmpty().withMessage("Valore mancante").trim().escape(); }
module.exports.validateGender =     (source, required=true, field_name="gender") => { return utils.handleRequired(validator[source](field_name), required).trim().isIn(["M", "F", "Non-binary", "Altro"]).withMessage("Formato non valido"); }
module.exports.validatePhone =      (source, required=true, field_name="phone") => { return utils.handleRequired(validator[source](field_name), required).isMobilePhone("any").withMessage("Formato non valido"); }
module.exports.validatePermission = (source, required=true, field_name="permission") => { return utils.handleRequired(validator[source](field_name), required); }

/**
 * Verifica i permessi per effettuare operazioni sull'oggetto
 */
module.exports.verifyUserOwnership = function (source) {
    return function (req, res, next) {
        if (req.auth.superuser || req.auth.username === req[source].username) {
            return next();
        }
        else {
            return next(error.generate.FORBIDDEN("Non sei il proprietario"));
        }
    }
}