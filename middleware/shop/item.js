const v = require("express-validator");
const { query, param } = require("express-validator");
const validator = require("../validators/shop");
const file_upload = require("express-fileupload");
const utils = require("../utils");


const validateCreate = [
    validator.validateItemName("body", validator.REQUIRED),
    validator.validateItemDescription("body", validator.OPTIONAL),
    validator.validateItemCategoryId("body", validator.REQUIRED),
    validator.validateListOfProducts("body", validator.REQUIRED),
    utils.validatorErrorHandler,
];

const validateSearchItem = [
    query("page_size").exists().isInt({ min: 1 }).withMessage("Il valore deve essere un intero che inizia da 1"),
    query("page_number").exists().isInt({ min: 0 }).withMessage("Il valore deve essere un intero che inizia da 0"),
    query("price_asc").optional().isBoolean().withMessage("Formato non valido"),
    query("price_desc").optional().isBoolean().withMessage("Formato non valido"),
    query("name_asc").optional().isBoolean().withMessage("Formato non valido"),
    query("name_desc").optional().isBoolean().withMessage("Formato non valido"),
    validator.validateItemCategoryId("query", validator.OPTIONAL),
    validator.validateItemName("query", validator.OPTIONAL),
    utils.validatorErrorHandler
];

const validateSearchItemByBarcode = [
    validator.validateProductBarcode("param", validator.REQUIRED),
    utils.validatorErrorHandler
];

const validateSearchProducts = [
    validator.validateItemId("param", validator.REQUIRED),
    utils.validatorErrorHandler
];

const validateUpdateItemById = [
    validator.validateItemId("param", validator.REQUIRED),
    validator.validateItemName("body", validator.OPTIONAL),
    validator.validateItemDescription("body", validator.OPTIONAL),
    validator.validateItemCategoryId("body", validator.OPTIONAL),
    utils.validatorErrorHandler
];

const validateUpdateProductByIndex = [
    validator.validateItemId("param", validator.REQUIRED),
    validator.validateProductIndex("param", validator.REQUIRED),
    validator.validateProductBarcode("body", validator.OPTIONAL),
    validator.validateItemName("body", validator.OPTIONAL),
    validator.validateItemDescription("body", validator.OPTIONAL),
    validator.validateProductTargetSpeciesId("body", validator.OPTIONAL),
    validator.validateProductPrice("body", validator.OPTIONAL),
    validator.validateProductQuantity("body", validator.OPTIONAL),
    utils.validatorErrorHandler
];

const validateDeleteItemById = [
    validator.validateItemId("param", validator.REQUIRED),
    utils.validatorErrorHandler
];

const validateDeleteProductByIndex = [
    validator.validateItemId("param", validator.REQUIRED),
    validator.validateProductIndex("param", validator.REQUIRED),
    utils.validatorErrorHandler
];


const validateCreateFileUpload = [
    validator.validateItemId("param", validator.REQUIRED),
    validator.validateProductIndex("param", validator.REQUIRED),
    utils.validatorErrorHandler,
    file_upload(),
    utils.verifyImage,
]

const validateDeleteImage = [
    validator.validateItemId("param", validator.REQUIRED),
    validator.validateProductIndex("param", validator.REQUIRED),
    validator.validateProductImageIndex("param", validator.REQUIRED),
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