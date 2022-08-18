const shop_validator = require("../validators/shop");
const user_validator = require("../validators/user");
const { REQUIRED, OPTIONAL } = require("../validators/utils");
const utils = require("../utils");
const error = require("../../error_handler");

const validateAddToCart = [
    user_validator.validateUsername("param", REQUIRED, "username"),
    shop_validator.validateProductBarcode("body", REQUIRED, "barcode"),
    shop_validator.validateProductQuantity("body", REQUIRED, "quantity"),
    utils.validatorErrorHandler,
    function (req, res, next) {
        if (req.auth.superuser) { return next(); }

        if (req.auth.username != req.params.username) { return next(error.generate.FORBIDDEN("Non puoi accedere al carrello altrui")); }

        return next();
    }
];

const validateGetCart = [
    user_validator.validateUsername("param", REQUIRED, "username"),
    utils.validatorErrorHandler,
    function (req, res, next) {
        if (req.auth.superuser) { return next(); }

        if (req.auth.username != req.params.username) { return next(error.generate.FORBIDDEN("Non puoi accedere al carrello altrui")); }

        return next();
    }
];

const validateUpdateCart = [
    user_validator.validateUsername("param", REQUIRED, "username"),
    shop_validator.validateOrderProductsList("body", REQUIRED, "cart"),
    utils.validatorErrorHandler,
    function (req, res, next) {
        if (req.auth.superuser) { return next(); }

        if (req.auth.username != req.params.username) { return next(error.generate.FORBIDDEN("Non puoi accedere al carrello altrui")); }

        return next();
    }
];


module.exports = {
    validateAddToCart: validateAddToCart,
    validateGetCart: validateGetCart,
    validateUpdateCart: validateUpdateCart
}