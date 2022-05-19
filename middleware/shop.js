const validator = require('express-validator');


function _errorHandler(req, res, next) {
    const errors = validator.validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send(errors.array());
    }
    else {
        next();
    }
}

const validateCreate = [
    _errorHandler
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
    _errorHandler
];

const validateSearchItemByBarcode = [
    validator.param("barcode").not().isEmpty().trim(),
    _errorHandler
];

const validateUpdateItemByBarcode = [
    _errorHandler
];


const validateDeleteItemByBarcode = [
    _errorHandler
];



const validateCreateCategory = [
    _errorHandler
];


const validateSearchCategory = [
    _errorHandler
];


const validateUpdateCategory = [
    _errorHandler
];


const validateDeleteCategory = [
    _errorHandler
];


module.exports = {
    item: {
        validateCreate: validateCreate,
        validateSearch: validateSearchItem,
        validateSearchByBarcode: validateSearchItemByBarcode,
        validateUpdate: validateUpdateItemByBarcode,
        validateDelete: validateDeleteItemByBarcode
    },
    category: {
        validateCreate: validateCreateCategory,
        validateSearch: validateSearchCategory,
        validateUpdate: validateUpdateCategory,
        validateDelete: validateDeleteCategory
    }
}