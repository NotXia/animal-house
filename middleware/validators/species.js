const validator = require("express-validator");
const utils = require("./utils");

module.exports.validateSpeciesName =            (source, required=true, field_name="name") => { return utils.handleRequired(validator[source](field_name), required).notEmpty().withMessage("Valore mancante").custom(value => !/\s/.test(value)).withMessage("Non sono permessi spazi").escape(); }
