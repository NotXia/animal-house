const { query } = require("express-validator");
const shop_validator = require("../validators/shop");
const hub_validator = require("../validators/hub");
const customer_validator = require("../validators/user.customer");
const { REQUIRED, OPTIONAL } = require("../validators/utils");
const utils = require("../utils");

const validateCreateOrder = [
    // Username del cliente estratto dai dati di autenticazione
    shop_validator.validateOrderProductsList("body", REQUIRED),
    hub_validator.validateCode("body", OPTIONAL, "hub_code"),
    customer_validator.validateAddress("body", OPTIONAL, "address"),
    shop_validator.validateOrderPickupFlag("body", REQUIRED).custom(function (pickup, {req}) {
        if (pickup && !req.body.hub_code) { throw new Error("Hub per il ritiro mancante"); }
        if (!pickup && !req.body.address) { throw new Error("Indirizzo di consegna mancante"); }
        return true;
    }),
    utils.validatorErrorHandler
];

const validateSearchOrder = [
    utils.validatorErrorHandler
];

const validateSearchOrderById = [
    utils.validatorErrorHandler
];

const validateUpdateOrder = [
    utils.validatorErrorHandler
];

const validateRemoveOrder = [
    utils.validatorErrorHandler
];


module.exports = {
    validateCreate: validateCreateOrder,
    validateSearch: validateSearchOrder,
    validateSearchById: validateSearchOrderById,
    validateUpdate: validateUpdateOrder,
    validateRemove: validateRemoveOrder
}