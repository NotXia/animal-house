const validator = require("express-validator");
const file_upload = require("express-fileupload");
const utils = require("../utils");


const validateCreate = [
    validator.body("name").exists().trim().escape(),
    validator.body("description").optional().trim().escape(),
    validator.body("category_id").exists().isMongoId(),
    validator.body("products").exists().notEmpty(),
    validator.body("products.*.barcode").exists().trim().escape(),
    validator.body("products.*.name").optional().trim().escape(),
    validator.body("products.*.description").optional().trim().escape(),
    validator.body("products.*.price").exists().isInt({ min: 0 }),
    validator.body("products.*.quantity").optional().isInt({ min: 0 }),
    validator.body("products.*.target_species_id").optional(),
    validator.body("products.*.target_species_id.*").optional().isMongoId(),
    utils.validatorErrorHandler,
];

const validateSearchItem = [
    validator.query("page_size").exists().isInt({ min: 1 }),
    validator.query("page_number").exists().isInt({ min: 0 }),
    validator.query("category_id").optional().isMongoId(),
    validator.query("name").optional().trim().escape(),
    validator.query("price_asc").optional().isBoolean(),
    validator.query("price_desc").optional().isBoolean(),
    validator.query("name_asc").optional().isBoolean(),
    validator.query("name_desc").optional().isBoolean(),
    utils.validatorErrorHandler
];

const validateSearchItemByBarcode = [
    validator.param("barcode").exists().trim(),
    utils.validatorErrorHandler
];

const validateSearchProducts = [
    validator.param("item_id").exists().isMongoId(),
    utils.validatorErrorHandler
];

const validateUpdateItemById = [
    validator.param("item_id").exists().isMongoId(),
    validator.body("name").optional().trim().escape(),
    validator.body("description").optional().trim().escape(),
    validator.body("category_id").optional().isMongoId(),
    utils.validatorErrorHandler
];

const validateUpdateProductByIndex = [
    validator.param("item_id").exists().isMongoId(),
    validator.param("product_index").exists().isInt({ min: 0 }),
    validator.body("barcode").optional().trim().escape(),
    validator.body("name").optional().trim().escape(),
    validator.body("description").optional().trim().escape(),
    validator.body("target_species_id").optional().isArray(),
    validator.body("target_species_id.*").optional().isMongoId(),
    validator.body("price").optional().isInt({ min: 0 }),
    validator.body("quantity").optional().isInt({ min: 0 }),
    utils.validatorErrorHandler
];

const validateDeleteItemById = [
    validator.param("item_id").exists().isMongoId(),
    utils.validatorErrorHandler
];

const validateDeleteProductByIndex = [
    validator.param("item_id").exists().isMongoId(),
    validator.param("product_index").exists().isInt({ min: 0 }),
    utils.validatorErrorHandler
];


const validateCreateFileUpload = [
    validator.param("item_id").exists().isMongoId(),
    validator.param("product_index").exists().isInt({ min: 0 }),
    utils.validatorErrorHandler,
    file_upload(),
    utils.verifyImage,
]

const validateDeleteImage = [
    validator.param("item_id").exists().isMongoId(),
    validator.param("product_index").exists().isInt({ min: 0 }),
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