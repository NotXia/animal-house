const validator = require("express-validator");
const utils = require("./utils");
const speciesValidator = require("./species");
const UserModel = require("../../models/auth/user");
const error = require("../../error_handler");

module.exports.validateAnimalId =           (source, required=true, field_name="animal_id") => { return utils.handleRequired(validator[source](field_name), required).isMongoId().withMessage("Formato non valido"); }
module.exports.validateAnimalSpecies =      (source, required=true, field_name="species") => { return speciesValidator.validateSpeciesName(source, required, field_name); }
module.exports.validateAnimalName =         (source, required=true, field_name="name") => { return utils.handleRequired(validator[source](field_name), required).notEmpty().withMessage("Valore mancante").trim().escape(); }
module.exports.validateAnimalWeight =       (source, required=true, field_name="weight") => { return utils.handleRequired(validator[source](field_name), required).isInt({ min: 0 }).withMessage("Valore invalido"); }
module.exports.validateAnimalHeight =       (source, required=true, field_name="height") => { return utils.handleRequired(validator[source](field_name), required).isInt({ min: 0 }).withMessage("Valore invalido"); }
module.exports.validateAnimalImagePath =    (source, required=true, field_name="image_path") => { return utils.handleRequired(validator[source](field_name), required).notEmpty().withMessage("Valore mancante").trim(); }

module.exports.verifyAnimalOwnership = async function(animal_id, username) {
    const user = await UserModel.findOne({ username: username }).exec();
    if (!user) { return error.generate.NOT_FOUND("Utente inesistente"); }
    const customer = await user.findType();
    if (!customer || user.isOperator()) { return error.generate.NOT_FOUND("Utente inesistente"); }

    if (!customer.animals_id.includes(animal_id)) { return error.generate.FORBIDDEN("Non sei il proprietario dell'animale"); }
}
