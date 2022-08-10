const validator = require("express-validator");
const shop_validator = require("../validators/shop");
const hub_validator = require("../validators/hub");
const customer_validator = require("../validators/user.customer");
const user_validator = require("../validators/user");
const { REQUIRED, OPTIONAL } = require("../validators/utils");
const utils = require("../utils");
const error = require("../../error_handler");

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
    validator.query("page_size").exists().isInt({ min: 1 }).withMessage("Il valore deve essere un intero che inizia da 1"),
    validator.query("page_number").exists().isInt({ min: 0 }).withMessage("Il valore deve essere un intero che inizia da 0"),
    shop_validator.validateOrderStatus("query", OPTIONAL),
    validator.query("start_date").optional().if(validator.query("end_date").exists()).exists().withMessage("Valore mancante").isISO8601().withMessage("Formato non valido"),
    validator.query("end_date").optional().if(validator.query("end_date").exists()).exists().withMessage("Valore mancante").isISO8601().withMessage("Formato non valido"),
    user_validator.validateUsername("query", OPTIONAL, "customer"),
    function (req, res, next) {
        if (!req.auth.superuser && req.query.customer != req.auth.username) { throw error.generate.FORBIDDEN("Non puoi visualizzare gli ordini altrui"); }
        next();
    },
    utils.validatorErrorHandler
];

const validateSearchOrderById = [
    shop_validator.validateOrderId("param", REQUIRED, "order_id"),
    utils.validatorErrorHandler,
    async function (req, res, next) {
        if (req.auth.superuser) { return next(); }

        let err = await shop_validator.verifyOrderOwnership(req.params.order_id, req.auth.username);
        if (err) { return next(err) };

        return next();
    }
];

const validateUpdateOrder = [
    shop_validator.validateOrderId("param", REQUIRED, "order_id"),
    shop_validator.validateOrderStatus("body", OPTIONAL),
    utils.validatorErrorHandler,
    async function (req, res, next) {
        if (req.auth.superuser) { return next(); }

        let err = await shop_validator.verifyOrderOwnership(req.params.order_id, req.auth.username);
        if (err) { return next(err) };

        return next();
    }
];

const validateRemoveOrder = [
    shop_validator.validateOrderId("param", REQUIRED, "order_id"),
    utils.validatorErrorHandler,
    async function (req, res, next) {
        if (req.auth.superuser) { return next(); }

        let err = await shop_validator.verifyOrderOwnership(req.params.order_id, req.auth.username);
        if (err) { return next(err) };

        return next();
    }
];


module.exports = {
    validateCreate: validateCreateOrder,
    validateSearch: validateSearchOrder,
    validateSearchById: validateSearchOrderById,
    validateUpdate: validateUpdateOrder,
    validateRemove: validateRemoveOrder
}