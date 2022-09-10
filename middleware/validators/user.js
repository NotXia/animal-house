const validator = require("express-validator");
const utils = require("./utils");
const error = require("../../error_handler");

module.exports.validateUsername =   (source, required=true, field_name="username") => { return utils.handleRequired(validator[source](field_name), required).notEmpty().withMessage("Valore mancante").trim(); }
module.exports.validatePassword =   (source, required=true, field_name="password") => { return utils.handleRequired(validator[source](field_name), required).isStrongPassword().withMessage("La password non è sufficientemente sicura"); }
module.exports.validateEmail =      (source, required=true, field_name="email") => { return utils.handleRequired(validator[source](field_name), required).isEmail().withMessage("Formato non valido").normalizeEmail(); }
module.exports.validateName =       (source, required=true, field_name="name") => { return utils.handleRequired(validator[source](field_name), required).notEmpty().withMessage("Valore mancante").trim(); }
module.exports.validateSurname =    (source, required=true, field_name="surname") => { return utils.handleRequired(validator[source](field_name), required).notEmpty().withMessage("Valore mancante").trim(); }
module.exports.validateGender =     (source, required=true, field_name="gender") => { return utils.handleRequired(validator[source](field_name), required).trim().isIn(["M", "F", "Non-binary", "Altro"]).withMessage("Formato non valido"); }
module.exports.validatePhone =      (source, required=true, field_name="phone") => { return utils.handleRequired(validator[source](field_name), required).isMobilePhone("any").withMessage("Formato non valido"); }
module.exports.validateEnabled =    (source, required=true, field_name="enabled") => { return utils.handleRequired(validator[source](field_name), required).isBoolean().withMessage("Formato non valido"); }
module.exports.validatePermissionName = (source, required=true, field_name="name") => { return utils.handleRequired(validator[source](field_name), required).notEmpty().withMessage("Valore mancante").trim(); }
module.exports.validatePermissions = function (source, required=true, field_name="permissions") { 
    return [
        utils.handleRequired(validator[source](field_name), required).isArray({ min: 0 }),
        module.exports.validatePermissionName(source, required, `${field_name}.*`)
    ];
}
module.exports.validateProfilePicture = (source, required=true, field_name="picture") => { return utils.handleRequired(validator[source](field_name), required).notEmpty().withMessage("Valore mancante").trim() }

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