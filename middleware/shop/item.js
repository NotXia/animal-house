const { query } = require("express-validator");
const validator = require("../validators/shop");
const { REQUIRED, OPTIONAL } = require("../validators/utils");
const file_upload = require("express-fileupload");
const utils = require("../utils");


const validateCreate = [
    validator.validateItemName("body", REQUIRED),
    validator.validateItemDescription("body", OPTIONAL),
    validator.validateItemCategoryId("body", REQUIRED),
    validator.validateListOfProducts("body", REQUIRED),
    utils.validatorErrorHandler,
];

const validateSearchItem = [
    query("page_size").exists().isInt({ min: 1 }).withMessage("Il valore deve essere un intero che inizia da 1"),
    query("page_number").exists().isInt({ min: 0 }).withMessage("Il valore deve essere un intero che inizia da 0"),
    query("price_asc").optional().isBoolean().withMessage("Formato non valido"),
    query("price_desc").optional().isBoolean().withMessage("Formato non valido"),
    query("name_asc").optional().isBoolean().withMessage("Formato non valido"),
    query("name_desc").optional().isBoolean().withMessage("Formato non valido"),
    validator.validateItemCategoryId("query", OPTIONAL),
    validator.validateItemName("query", OPTIONAL),
    utils.validatorErrorHandler
];

const validateSearchItemByBarcode = [
    validator.validateProductBarcode("param", REQUIRED),
    utils.validatorErrorHandler
];

const validateSearchProducts = [
    validator.validateItemId("param", REQUIRED),
    utils.validatorErrorHandler
];

const validateUpdateItemById = [
    validator.validateItemId("param", REQUIRED),
    validator.validateItemName("body", OPTIONAL),
    validator.validateItemDescription("body", OPTIONAL),
    validator.validateItemCategoryId("body", OPTIONAL),
    utils.validatorErrorHandler
];

const validateUpdateProductByIndex = [
    validator.validateItemId("param", REQUIRED),
    validator.validateProductIndex("param", REQUIRED),
    validator.validateProductBarcode("body", OPTIONAL),
    validator.validateItemName("body", OPTIONAL),
    validator.validateItemDescription("body", OPTIONAL),
    validator.validateProductTargetSpeciesId("body", OPTIONAL),
    validator.validateProductPrice("body", OPTIONAL),
    validator.validateProductQuantity("body", OPTIONAL),
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


const validateCreateFileUpload = [
    validator.validateItemId("param", REQUIRED),
    validator.validateProductIndex("param", REQUIRED),
    utils.validatorErrorHandler,
    file_upload(),
    utils.verifyImage,
]

const validateDeleteImage = [
    validator.validateItemId("param", REQUIRED),
    validator.validateProductIndex("param", REQUIRED),
    validator.validateProductImageIndex("param", REQUIRED),
    utils.validatorErrorHandler
]


module.exports = {
    validateCreate: validateCreate,
    validateCreateFileUpload: validateCreateFileUpload,
    validateSearch: validateSearchItem,
    validateSearchByBarcode: validateSearchItemByBarcode,
    validateSearchProducts: validateSearchProducts,
    validateUpdateItem: validateUpdateItemById,
    validateUpdateProduct: validateUpdateProductByIndex,
    validateDeleteItem: validateDeleteItemById,
    validateDeleteProduct: validateDeleteProductByIndex,
    validateDeleteImage: validateDeleteImage
}