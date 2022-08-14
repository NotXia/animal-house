const validator = require("express-validator");
const utils = require("./utils");
const speciesValidator = require("./species");

module.exports.validateAnimalSpecies =      (source, required=true, field_name="species") => { return speciesValidator.validateSpeciesName(source, required, field_name); }
module.exports.validateAnimalName =         (source, required=true, field_name="name") => { return utils.handleRequired(validator[source](field_name), required).notEmpty().withMessage("Valore mancante").trim().escape(); }
module.exports.validateAnimalWeight =       (source, required=true, field_name="weight") => { return utils.handleRequired(validator[source](field_name), required).isInt({ min: 0 }).withMessage("Valore invalido"); }
module.exports.validateAnimalHeight =       (source, required=true, field_name="height") => { return utils.handleRequired(validator[source](field_name), required).isInt({ min: 0 }).withMessage("Valore invalido"); }
module.exports.validateAnimalImagePath =    (source, required=true, field_name="image_path") => { return utils.handleRequired(validator[source](field_name), required).notEmpty().withMessage("Valore mancante").trim(); }

