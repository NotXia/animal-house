const { query } = require("express-validator");
const validator = require("../validators/shop");
const { REQUIRED, OPTIONAL } = require("../validators/utils");
const file_upload = require("express-fileupload");
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
    utils.validatorErrorHandler
];

const validateUpdateProductByIndex = [
    validator.validateItemId("param", REQUIRED),
    validator.validateProductIndex("param", REQUIRED),
    validator.validateProductBarcode("body", OPTIONAL),
    validator.validateItemName("body", OPTIONAL),
    validator.validateItemDescription("body", OPTIONAL),
    validator.validateProductTargetSpecies("body", OPTIONAL),
    validator.validateProductPrice("body", OPTIONAL),
    validator.validateProductQuantity("body", OPTIONAL),
    validator.validateProductImages("body", OPTIONAL),
    utils.validatorErrorHandler
];

const validateDeleteItemById = [
    validator.validateItemId("param", REQUIRED),
    utils.validatorErrorHandler
];

const validateDeleteProductByIndex = [
    validator.validateItemId("param", REQUIRED),
    validator.validateProductIndex("param", REQUIRED),
    utils.validatorErrorHandler
];

const validateCreateProduct = [
    validator.validateItemId("param", REQUIRED, "item_id"),
    validator.validateProductBarcode("body", REQUIRED),
    validator.validateItemName("body", REQUIRED),
    validator.validateItemDescription("body", OPTIONAL),
    validator.validateProductTargetSpecies("body", OPTIONAL),
    validator.validateProductPrice("body", REQUIRED),
    validator.validateProductQuantity("body", REQUIRED),
    validator.validateProductImages("body", OPTIONAL),
    utils.validatorErrorHandler
];

module.exports = {
    validateCreate: validateCreate,
    validateSearch: validateSearchItems,
    validateSearchByBarcode: validateSearchItemByBarcode,
    validateSearchItem: validateSearchSingleItem,
    validateUpdateItem: validateUpdateItemById,
    validateUpdateProduct: validateUpdateProductByIndex,
    validateDeleteItem: validateDeleteItemById,
    validateDeleteProduct: validateDeleteProductByIndex,
    validateCreateProduct: validateCreateProduct
}