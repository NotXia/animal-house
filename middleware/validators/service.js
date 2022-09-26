const validator = require("express-validator");
const utils = require("./utils");

module.exports.validateServiceId =              (source, required=true, field_name="service_id") => { return utils.handleRequired(validator[source](field_name), required).isMongoId().withMessage("Formato non valido"); }
module.exports.validateServiceName =            (source, required=true, field_name="name") => { return utils.handleRequired(validator[source](field_name), required).notEmpty().withMessage("Valore mancante").trim(); }
module.exports.validateServiceDescription =     (source, required=true, field_name="description") => { return utils.handleRequired(validator[source](field_name), required).notEmpty().withMessage("Valore mancante").trim(); }
module.exports.validateServiceDuration =        (source, required=true, field_name="duration") => { return utils.handleRequired(validator[source](field_name), required).isInt({ min: 0 }).withMessage("Valore invalido"); }
module.exports.validateServicePrice =           (source, required=true, field_name="price") => { return utils.handleRequired(validator[source](field_name), required).isInt({ min: 0 }).withMessage("Valore invalido"); }
module.exports.validateServiceOnline =          (source, required=true, field_name="online") => { return utils.handleRequired(validator[source](field_name), required).isBoolean().withMessage("Formato non valido"); }
module.exports.validateServiceTarget = function (source, required=true, field_name="target") {
    return [
        utils.handleRequired(validator[source](field_name), required).isArray().withMessage("Valore invalido"),
        utils.handleRequired(validator[source](`${field_name}.*`), required).notEmpty().withMessage("Valore mancante").trim()
    ]
}
