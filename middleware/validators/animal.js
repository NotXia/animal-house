const validator = require("express-validator");
const utils = require("./utils");

module.exports.validateAnimalId =              (source, required=true, field_name="animal_id") => { return utils.handleRequired(validator[source](field_name), required).isMongoId().withMessage("Formato non valido"); }
