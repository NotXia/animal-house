const validator = require("../validators/shop");
const { REQUIRED, OPTIONAL } = require("../validators/utils");
const utils = require("../utils");

const validateInsertCategory = [
    validator.validateCategoryName("body", REQUIRED),
    validator.validateCategoryIcon("body", OPTIONAL),
    utils.validatorErrorHandler
];

const validateUpdateCategory = [
    validator.validateCategoryName("param", REQUIRED, "category"),
    validator.validateCategoryName("body", OPTIONAL),
    validator.validateCategoryIcon("body", OPTIONAL),
    utils.validatorErrorHandler
];

const validateDeleteCategory = [
    validator.validateCategoryName("param", REQUIRED, "category"),
    utils.validatorErrorHandler
];

module.exports = {
    validateCreate: validateInsertCategory,
    validateUpdate: validateUpdateCategory,
    validateDelete: validateDeleteCategory
}