const shop_validator = require("../validators/shop");
const user_validator = require("../validators/user");
const { REQUIRED, OPTIONAL } = require("../validators/utils");
const utils = require("../utils");

const validateAddToCart = [
    user_validator.validateUsername("param", REQUIRED, "username"),
    shop_validator.validateProductBarcode("body", REQUIRED, "barcode"),
    shop_validator.validateProductQuantity("body", REQUIRED, "quantity"),
    utils.validatorErrorHandler
];

const validateGetCart = [
    user_validator.validateUsername("param", REQUIRED, "username"),
    utils.validatorErrorHandler
];

const validateUpdateCart = [
    user_validator.validateUsername("param", REQUIRED, "username"),
    shop_validator.validateOrderProductsList("body", REQUIRED, "cart"),
    utils.validatorErrorHandler
];


module.exports = {
    validateAddToCart: validateAddToCart,
    validateGetCart: validateGetCart,
    validateUpdateCart: validateUpdateCart
}