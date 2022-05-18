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

const validateInsertCustomer = [
    validator.body("username").exists().trim(),
    validator.body("password").exists().isStrongPassword(),
    validator.body("email").exists().isEmail().normalizeEmail(),
    validator.body("name").exists().trim(),
    validator.body("surname").exists().trim(),
    validator.body("gender").optional().trim().isIn(["M", "F", "Non-binary", "Altro"]),
    validator.body("city").optional().trim(),
    validator.body("street").optional().trim(),
    validator.body("number").optional().trim(),
    validator.body("postal_code").optional().isPostalCode("any"),
    validator.body("phone").optional().isMobilePhone("any"),
    _errorHandler
];

const validateInsertOperator = [
    validator.body("username").exists().trim(),
    validator.body("password").exists().isStrongPassword(),
    validator.body("email").exists().isEmail().normalizeEmail(),
    validator.body("name").exists().trim(),
    validator.body("surname").exists().trim(),
    validator.body("gender").optional().trim().isIn(["M", "F", "Non-binary", "Altro"]),
    validator.body("role_id").optional().isMongoId(),
    // validator.body("permission"),
    // validator.body("working_time"),
    _errorHandler
];

const validateSearchUser = [
    validator.param("username").exists().trim(),
    _errorHandler
];

const validateUpdateUser = [
    validator.param("username").exists().trim(),
    validator.body("password").optional().isStrongPassword(),
    validator.body("email").optional().isEmail().normalizeEmail(),
    validator.body("name").optional().trim(),
    validator.body("surname").optional().trim(),
    validator.body("gender").optional().trim().isIn(["M", "F", "Non-binary", "Altro"]),
    validator.body("city").optional().trim(),
    validator.body("street").optional().trim(),
    validator.body("number").optional().trim(),
    validator.body("postal_code").optional().isPostalCode("any"),
    validator.body("phone").optional().isMobilePhone("any"),
    validator.body("role_id").optional().isMongoId(),
    // validator.body("permission"),
    // validator.body("working_time"),
    // validator.body("absence_time"),
    _errorHandler
];

const validateDeleteUser = [
    validator.param("username").exists().trim(),
    _errorHandler
];

module.exports = {
    validateInsertCustomer : validateInsertCustomer,
    validateInsertOperator : validateInsertOperator,
    validateSearchUser : validateSearchUser,
    validateUpdateUser : validateUpdateUser,
    validateDeleteUser : validateDeleteUser
}