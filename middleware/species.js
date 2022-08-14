const utils = require("./utils");
const { REQUIRED, OPTIONAL } = require("./validators/utils");
const validator = require("./validators/species");

const validateAddSpecies = [
    validator.validateSpeciesName("body", REQUIRED),
    utils.validatorErrorHandler
]

const validateGetSpecies = [
    validator.validateSpeciesName("query", OPTIONAL),
    utils.validatorErrorHandler
]

module.exports = {
    validateAddSpecies: validateAddSpecies,
    validateGetSpecies: validateGetSpecies,
}