const { query } = require("express-validator");
const validator = require("../validators/shop");
const { REQUIRED, OPTIONAL } = require("../validators/utils");
const utils = require("../utils");


const validateCreate = [
    validator.validateItemName("body", REQUIRED),
    validator.validateItemDescription("body", OPTIONAL),
    validator.validateCategoryName("body", REQUIRED, "category"),
    validator.validateItemRelevance("body", OPTIONAL),
    validator.validateListOfProducts("body", REQUIRED),
    utils.validatorErrorHandler,
];

const validateSearchItems = [
    query("page_size").exists().isInt({ min: 1 }).withMessage("Il valore deve essere un intero che inizia da 1"),
    query("page_number").exists().isInt({ min: 0 }).withMessage("Il valore deve essere un intero che inizia da 0"),
    query("price_asc").optional().isBoolean().withMessage("Formato non valido"),
    query("price_desc").optional().isBoolean().withMessage("Formato non valido"),
    query("name_asc").optional().isBoolean().withMessage("Formato non valido"),
    query("name_desc").optional().isBoolean().withMessage("Formato non valido"),
    validator.validateCategoryName("query", OPTIONAL, "category"),
    validator.validateItemName("query", OPTIONAL),
    utils.validatorErrorHandler
];

const validateSearchItemByBarcode = [
    validator.validateProductBarcode("param", REQUIRED),
    utils.validatorErrorHandler
];

const validateSearchSingleItem = [
    validator.validateItemId("param", REQUIRED),
    utils.validatorErrorHandler
];

const validateUpdateItemById = [
    validator.validateItemId("param", REQUIRED),
    validator.validateItemName("body", OPTIONAL),
    validator.validateItemDescription("body", OPTIONAL),
    validator.validateCategoryName("body", OPTIONAL, "category"),
    validator.validateItemRelevance("body", OPTIONAL),
    validator.validateListOfProducts("body", OPTIONAL),
    utils.validatorErrorHandler
];

const validateDeleteItemById = [
    validator.validateItemId("param", REQUIRED),
    utils.validatorErrorHandler
];


module.exports = {
    validateCreate: validateCreate,
    validateSearch: validateSearchItems,
    validateSearchByBarcode: validateSearchItemByBarcode,
    validateSearchItem: validateSearchSingleItem,
    validateUpdateItem: validateUpdateItemById,
    validateDeleteItem: validateDeleteItemById
}