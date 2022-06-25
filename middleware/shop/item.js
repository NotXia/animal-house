const validator = require("express-validator");
const file_upload = require("express-fileupload");
const utils = require("../utils");

function validateName(source)           { return source("name").trim().escape(); }
function validateDescription(source)    { return source("description").trim().escape(); }
function validateCategoryId(source)     { return source("category_id").isMongoId().withMessage("Formato non valido"); }
function validateBarcode(source)        { return source("barcode").trim(); }
function validateItemId(source)         { return source("item_id").isMongoId().withMessage("Formato non valido"); }

function validateProductIndex(source)       { return source("product_index").isInt({ min: 0 }).withMessage("Formato non valido"); }
function validatePrice(source)              { return source("price").isInt({ min: 0 }).withMessage("Formato non valido"); }
function validateQuantity(source)           { return source("quantity").isInt({ min: 0 }).withMessage("Formato non valido"); }
function validateTargetSpeciesId(source)    { return source("target_species_id.*").isMongoId().withMessage("Formato non valido"); }

function validateProductsArrayExists(source) { 
    return [
        source("products").exists().notEmpty().withMessage("Nessun prodotto inserito"),
        source("products.*.barcode").exists().withMessage("Valore mancante").trim().escape(),
        source("products.*.name").optional().trim().escape(),
        source("products.*.description").optional().trim().escape(),
        source("products.*.price")
            .exists().withMessage("Valore mancante")
            .isInt({ min: 0 }).withMessage("Formato non valido"),
        source("products.*.quantity").optional().isInt({ min: 0 }).withMessage("Formato non valido"),
        source("products.*.target_species_id").optional(),
        source("products.*.target_species_id.*").optional().isMongoId().withMessage("Formato non valido"),
    ]; 
}

const validateCreate = [
    validateName(validator.body).exists().withMessage("Valore mancante"),
    validateDescription(validator.body).optional(),
    validateCategoryId(validator.body).exists().withMessage("Valore mancante"),
    validateProductsArrayExists(validator.body),
    utils.validatorErrorHandler,
];

const validateSearchItem = [
    validator.query("page_size").exists().isInt({ min: 1 }).withMessage("Il valore deve essere un intero che inizia da 1"),
    validator.query("page_number").exists().isInt({ min: 0 }).withMessage("Il valore deve essere un intero che inizia da 0"),
    validator.query("price_asc").optional().isBoolean().withMessage("Formato non valido"),
    validator.query("price_desc").optional().isBoolean().withMessage("Formato non valido"),
    validator.query("name_asc").optional().isBoolean().withMessage("Formato non valido"),
    validator.query("name_desc").optional().isBoolean().withMessage("Formato non valido"),
    validateCategoryId(validator.query).optional(),
    validateName(validator.query).optional(),
    utils.validatorErrorHandler
];

const validateSearchItemByBarcode = [
    validateBarcode(validator.param).exists().withMessage("Valore mancante"),
    utils.validatorErrorHandler
];

const validateSearchProducts = [
    validateItemId(validator.param).exists().withMessage("Valore mancante"),
    utils.validatorErrorHandler
];

const validateUpdateItemById = [
    validateItemId(validator.param).exists().withMessage("Valore mancante"),
    validateName(validator.body).optional(),
    validateDescription(validator.body).optional(),
    validateCategoryId(validator.body).optional(),
    utils.validatorErrorHandler
];

const validateUpdateProductByIndex = [
    validateItemId(validator.param).exists().withMessage("Valore mancante"),
    validateProductIndex(validator.param).exists().withMessage("Valore mancante"),
    validateBarcode(validator.body).optional(),
    validateName(validator.body).optional(),
    validateDescription(validator.body).optional(),
    validateTargetSpeciesId(validator.body).optional(),
    validatePrice(validator.body).optional(),
    validateQuantity(validator.body).optional(),
    utils.validatorErrorHandler
];

const validateDeleteItemById = [
    validateItemId(validator.param).exists().withMessage("Valore mancante"),
    utils.validatorErrorHandler
];

const validateDeleteProductByIndex = [
    validateItemId(validator.param).exists().withMessage("Valore mancante"),
    validateProductIndex(validator.param).exists().withMessage("Valore mancante"),
    utils.validatorErrorHandler
];


const validateCreateFileUpload = [
    validateItemId(validator.param).exists().withMessage("Valore mancante"),
    validateProductIndex(validator.param).exists().withMessage("Valore mancante"),
    utils.validatorErrorHandler,
    file_upload(),
    utils.verifyImage,
]

const validateDeleteImage = [
    validateItemId(validator.param).exists().withMessage("Valore mancante"),
    validateProductIndex(validator.param).exists().withMessage("Valore mancante"),
    validator.param("image_index").exists().isInt({ min: 0 }).withMessage("Il valore deve essere un intero che inizia da 0"),
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