const validator = require("express-validator");
const utils = require("./utils");
const { REQUIRED, OPTIONAL } = require("./validators/utils");
const species_validator = require("./validators/species");

const validateAnimalFact = [
    species_validator.validateSpeciesName("query", OPTIONAL, "animal"),
    utils.validatorErrorHandler
];

const validateAnimalImage = [
    species_validator.validateSpeciesName("query", OPTIONAL, "animal"),
    utils.validatorErrorHandler
];

const validateQuizAnswer = [
    validator.param("quiz_id").exists().notEmpty().isMongoId(),
    validator.body("answer").exists().notEmpty(),
    utils.validatorErrorHandler
];

const validateHangmanAnswer = [
    validator.param("game_id").exists().notEmpty().isMongoId(),
    validator.body("attempt").exists().notEmpty(),
    utils.validatorErrorHandler
];

const validateMemoryAnswer = [
    validator.param("game_id").exists().notEmpty().isMongoId(),
    validator.query("index").exists().isNumeric(),
    utils.validatorErrorHandler
];

module.exports = {
    validateAnimalFact: validateAnimalFact,
    validateAnimalImage: validateAnimalImage,
    validateQuizAnswer: validateQuizAnswer,
    validateHangmanAnswer: validateHangmanAnswer,
    validateMemoryAnswer: validateMemoryAnswer
}