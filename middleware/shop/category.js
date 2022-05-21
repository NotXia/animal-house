const validator = require("express-validator");
const file_upload = require("express-fileupload");
const utils = require("../utils");


const validateCreateCategory = [
    utils.errorHandler
];


const validateSearchCategory = [
    utils.errorHandler
];


const validateUpdateCategory = [
    utils.errorHandler
];


const validateDeleteCategory = [
    utils.errorHandler
];


module.exports = {
    validateCreate: validateCreateCategory,
    validateSearch: validateSearchCategory,
    validateUpdate: validateUpdateCategory,
    validateDelete: validateDeleteCategory
}