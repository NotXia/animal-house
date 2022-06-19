const validator = require("express-validator");
const file_upload = require("express-fileupload");
const utils = require("../utils");

function validateName(source)           { return source("name").trim().escape(); }
function validateDescription(source)    { return source("description").trim().escape(); }
function validateCategoryId(source)     { return source("category_id").isMongoId(); }
function validateBarcode(source)        { return source("barcode").trim(); }
function validateItemId(source)         { return source("item_id").isMongoId(); }

function validateProductIndex(source) { return source("product_index").isInt({ min: 0 }); }
function validatePrice(source) { return source("price").isInt({ min: 0 }); }
function validateQuantity(source) { return source("quantity").isInt({ min: 0 }); }
function validateTargetSpeciesId(source) { return source("target_species_id.*").isMongoId(); }

function validateProductsArrayExists(source) { 
    return [
        source("products").exists().notEmpty(),
        source("products.*.barcode").exists().trim().escape(),
        source("products.*.name").optional().trim().escape(),
        source("products.*.description").optional().trim().escape(),
        source("products.*.price").exists().isInt({ min: 0 }),
        source("products.*.quantity").optional().isInt({ min: 0 }),
        source("products.*.target_species_id").optional(),
        source("products.*.target_species_id.*").optional().isMongoId(),
    ]; 
}

const validateCreate = [
    validateName(validator.body).exists(),
    validateDescription(validator.body).optional(),
    validateCategoryId(validator.body).exists(),
    validateProductsArrayExists(validator.body),
    utils.validatorErrorHandler,
];

const validateSearchItem = [
    validator.query("page_size").exists().isInt({ min: 1 }),
    validator.query("page_number").exists().isInt({ min: 0 }),
    validator.query("price_asc").optional().isBoolean(),
    validator.query("price_desc").optional().isBoolean(),
    validator.query("name_asc").optional().isBoolean(),
    validator.query("name_desc").optional().isBoolean(),
    validateCategoryId(validator.query).optional(),
    validateName(validator.query).optional(),
    utils.validatorErrorHandler
];

const validateSearchItemByBarcode = [
    validateBarcode(validator.param).exists(),
    utils.validatorErrorHandler
];

const validateSearchProducts = [
    validateItemId(validator.param).exists(),
    utils.validatorErrorHandler
];

const validateUpdateItemById = [
    validateItemId(validator.param).exists(),
    validateName(validator.body).optional(),
    validateDescription(validator.body).optional(),
    validateCategoryId(validator.body).optional(),
    utils.validatorErrorHandler
];

const validateUpdateProductByIndex = [
    validateItemId(validator.param).exists(),
    validateProductIndex(validator.param).exists(),
    validateBarcode(validator.body).optional(),
    validateName(validator.body).optional(),
    validateDescription(validator.body).optional(),
    validateTargetSpeciesId(validator.body).optional(),
    validatePrice(validator.body).optional(),
    validateQuantity(validator.body).optional(),
    utils.validatorErrorHandler
];

const validateDeleteItemById = [
    validateItemId(validator.param).exists(),
    utils.validatorErrorHandler
];

const validateDeleteProductByIndex = [
    validateItemId(validator.param).exists(),
    validateProductIndex(validator.param).exists(),
    utils.validatorErrorHandler
];


const validateCreateFileUpload = [
    validateItemId(validator.param).exists(),
    validateProductIndex(validator.param).exists(),
    utils.validatorErrorHandler,
    file_upload(),
    utils.verifyImage,
]

const validateDeleteImage = [
    validateItemId(validator.param).exists(),
    validateProductIndex(validator.param).exists(),
    validator.param("image_index").exists().isInt({ min: 0 }),
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