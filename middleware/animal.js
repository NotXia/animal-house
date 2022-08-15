const utils = require("./utils");
const { REQUIRED, OPTIONAL } = require("./validators/utils");
const validator = require("./validators/animal");
const user_validator = require("./validators/user");

const validateGetAnimalById = [
    validator.validateAnimalId("param", REQUIRED),
    utils.validatorErrorHandler
]

const validateUpdateAnimal = [
    user_validator.validateUsername("param", REQUIRED),
    validator.validateAnimalId("param", REQUIRED),
    validator.validateAnimalSpecies("body", OPTIONAL),
    validator.validateAnimalName("body", OPTIONAL),
    validator.validateAnimalWeight("body", OPTIONAL),
    validator.validateAnimalHeight("body", OPTIONAL),
    validator.validateAnimalImagePath("body", OPTIONAL),
    utils.validatorErrorHandler
]

const validateDeleteAnimal = [
    user_validator.validateUsername("param", REQUIRED),
    validator.validateAnimalId("param", REQUIRED),
    utils.validatorErrorHandler
]

module.exports = {
    validateGetAnimalById: validateGetAnimalById,
    validateUpdateAnimal: validateUpdateAnimal,
    validateDeleteAnimal: validateDeleteAnimal
}