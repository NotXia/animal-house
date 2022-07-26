const validator = require("express-validator");
const utils = require("./utils");

module.exports.validateServiceName =   (source, required=true, field_name="name") => { return utils.handleRequired(validator[source](field_name), required).notEmpty().withMessage("Valore mancante").trim().escape(); }
