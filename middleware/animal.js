const utils = require("./utils");
const { REQUIRED, OPTIONAL } = require("./validators/utils");
const validator = require("./validators/animal");
const user_validator = require("./validators/user");

const validateGetAnimalById = [
    validator.validateAnimalId("param", REQUIRED),
    utils.validatorErrorHandler
]

const validateAddAnimal = [
    user_validator.validateUsername("param", REQUIRED),
    validator.validateAnimalSpecies("body", REQUIRED),
    validator.validateAnimalName("body", REQUIRED),
    validator.validateAnimalWeight("body", OPTIONAL),
    validator.validateAnimalHeight("body", OPTIONAL),
    validator.validateAnimalImagePath("body", OPTIONAL),
    utils.validatorErrorHandler
]

const validateGetAnimals = [
    user_validator.validateUsername("param", REQUIRED),
    utils.validatorErrorHandler
]

const validateUpdateAnimal = [
    validator.validateAnimalId("param", REQUIRED),
    validator.validateAnimalSpecies("body", OPTIONAL),
    validator.validateAnimalName("body", OPTIONAL),
    validator.validateAnimalWeight("body", OPTIONAL),
    validator.validateAnimalHeight("body", OPTIONAL),
    validator.validateAnimalImagePath("body", OPTIONAL),
    utils.validatorErrorHandler,
    async function (req, res, next) {
        if (req.auth.superuser) { return next(); }

        let err = await validator.verifyAnimalOwnership(req.params.animal_id, req.auth.username);
        if (err) { return next(err) };

        return next();
    }
]

const validateDeleteAnimal = [
    validator.validateAnimalId("param", REQUIRED),
    utils.validatorErrorHandler,
    async function (req, res, next) {
        if (req.auth.superuser) { return next(); }

        let err = await validator.verifyAnimalOwnership(req.params.animal_id, req.auth.username);
        if (err) { return next(err) };

        return next();
    }
]

module.exports = {
    validateGetAnimalById: validateGetAnimalById,
    validateAddAnimal: validateAddAnimal,
    validateGetAnimals: validateGetAnimals,
    validateUpdateAnimal: validateUpdateAnimal,
    validateDeleteAnimal: validateDeleteAnimal
}