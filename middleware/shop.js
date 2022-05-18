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
    _errorHandler
];

const validateSearchItemByBarcode = [
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