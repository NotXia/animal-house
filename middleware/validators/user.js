const validator = require("express-validator");
const utils = require("./utils");
const error = require("../../error_handler");
const service_validator = require("./service");
const { WEEKS } = require("../../utilities");

module.exports.validateUsername =   (source, required=true, field_name="username") => { return utils.handleRequired(validator[source](field_name), required).notEmpty().withMessage("Valore mancante").trim().escape(); }
module.exports.validatePassword =   (source, required=true, field_name="password") => { return utils.handleRequired(validator[source](field_name), required).isStrongPassword().withMessage("La password non è sufficientemente sicura"); }
module.exports.validateEmail =      (source, required=true, field_name="email") => { return utils.handleRequired(validator[source](field_name), required).isEmail().withMessage("Formato non valido").normalizeEmail(); }
module.exports.validateName =       (source, required=true, field_name="name") => { return utils.handleRequired(validator[source](field_name), required).notEmpty().withMessage("Valore mancante").trim().escape(); }
module.exports.validateSurname =    (source, required=true, field_name="surname") => { return utils.handleRequired(validator[source](field_name), required).notEmpty().withMessage("Valore mancante").trim().escape(); }
module.exports.validateGender =     (source, required=true, field_name="gender") => { return utils.handleRequired(validator[source](field_name), required).trim().isIn(["M", "F", "Non-binary", "Altro"]).withMessage("Formato non valido"); }
module.exports.validatePhone =      (source, required=true, field_name="phone") => { return utils.handleRequired(validator[source](field_name), required).isMobilePhone("any").withMessage("Formato non valido"); }
module.exports.validatePermission = (source, required=true, field_name="permission") => { return utils.handleRequired(validator[source](field_name), required); }

module.exports.validateRole = (source, required=true, field_name="role") => { return utils.handleRequired(validator[source](field_name), required).notEmpty().withMessage("Valore mancante").trim().escape(); }
module.exports.validateListOfServices = function (source, required=true, field_name="services") {
    return [
        utils.handleRequired(validator[source](field_name), required),
        service_validator.validateServiceName(source, utils.OPTIONAL, `${field_name}.*`)
    ];
}
module.exports.validateWorkingTime = function (source, required=true, field_name="working_time") {
    if (required) {
        let out = [ utils.handleRequired(validator[source](field_name), required) ];
        
        for (const week of WEEKS) {
            out.push(validator[source](`${field_name}.${week}`).exists().withMessage(`Valore di ${week} mancante`));
            out.push(validator[source](`${field_name}.${week}.*.time.start`).optional().isISO8601().withMessage("Formato non valido").toDate());
            out.push(validator[source](`${field_name}.${week}.*.time.end`).optional().isISO8601().withMessage("Formato non valido").toDate());
            out.push(validator[source](`${field_name}.${week}.*.hub_id`).optional().isMongoId().withMessage("Formato non valido"));
        }

        return out;
    }
    else {
        return utils.handleRequired(validator[source](field_name), utils.OPTIONAL);
    }
};

module.exports.validateAbsenceTime = function (source, required=true, field_name="absence_time") {
    if (required) {
        let out = [ utils.handleRequired(validator[source](field_name), required) ];
    
        for (const week of WEEKS) {
            out.push(validator[source](`${field_name}.${week}`).optional());
            out.push(validator[source](`${field_name}.${week}.*.time`).optional());
            out.push(validator[source](`${field_name}.${week}.*.time.start`).optional().isISO8601().withMessage("Formato non valido").toDate());
            out.push(validator[source](`${field_name}.${week}.*.time.end`).optional().isISO8601().withMessage("Formato non valido").toDate());
        }
    
        return out;
    }
    else {
        return utils.handleRequired(validator[source](field_name), utils.OPTIONAL);
    }
};

module.exports.validateAddress = function (source, required=true, field_name="address") {
    if (required) {
        return [
            utils.handleRequired(validator[source](field_name), utils.REQUIRED),
            validator[source](`${field_name}.city`).exists().trim().escape(),
            validator[source](`${field_name}.street`).exists().trim().escape(),
            validator[source](`${field_name}.number`).exists().trim().escape(),
            validator[source](`${field_name}.postal_code`).exists().isPostalCode("any").withMessage("Formato non valido"),
        ];
    }
    else {
        return utils.handleRequired(validator[source](field_name), utils.OPTIONAL);
    }
}

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