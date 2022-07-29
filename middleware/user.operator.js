const utils = require("./utils");
const validator = require("./validators/user");
const { REQUIRED, OPTIONAL } = require("./validators/utils");
const error = require("../error_handler");

const validateUpdateAbsence = [
    // validator.validateAddress("body", REQUIRED),
    // utils.validatorErrorHandler,
    // groupCustomerData("body")
];

module.exports = {
    validateUpdateAbsence: validateUpdateAbsence
}