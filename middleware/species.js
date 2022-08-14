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

const validateUpdateSpecies = [
    validator.validateSpeciesName("param", REQUIRED),
    validator.validateSpeciesName("body", REQUIRED),
    utils.validatorErrorHandler
]

const validateDeleteSpecies = [
    validator.validateSpeciesName("param", REQUIRED),
    utils.validatorErrorHandler
]

module.exports = {
    validateAddSpecies: validateAddSpecies,
    validateGetSpecies: validateGetSpecies,
    validateUpdateSpecies: validateUpdateSpecies,
    validateDeleteSpecies: validateDeleteSpecies
}