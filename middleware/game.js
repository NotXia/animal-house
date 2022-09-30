const utils = require("./utils");
const { REQUIRED, OPTIONAL } = require("./validators/utils");
const species_validator = require("./validators/species");

const validateAnimalFact = [
    species_validator.validateSpeciesName("param", OPTIONAL, "animal"),
    utils.validatorErrorHandler
]

module.exports = {
    validateAnimalFact: validateAnimalFact
}