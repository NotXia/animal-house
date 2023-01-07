const validator = require("express-validator");
const shop_validator = require("../validators/shop");
const { REQUIRED, OPTIONAL } = require("../validators/utils");
const utils = require("../utils");

const validateInsertDiscount = [
    shop_validator.validateProductBarcode("param", REQUIRED, "barcode"),
    validator.body("discount").exists().isInt({ min: 0, max: 100 }),
    validator.body("start_date").exists().isISO8601(),
    validator.body("end_date").exists().isISO8601(),
    utils.validatorErrorHandler
];

const validateDeleteDiscount = [
    validator.param("id").exists().isMongoId(),
    utils.validatorErrorHandler
];

module.exports = {
    add: validateInsertDiscount,
    delete: validateDeleteDiscount
}