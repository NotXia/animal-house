const validator = require('express-validator');
const utils = require("./utils");

const validateInsertPost = [
    validator.body("user_id").exists().isMongoId(),
    validator.body("content").exists(),
    validator.body("category").optional().trim().escape(),
    validator.body("tag_users_id").optional().isMongoId(),
    validator.body("tag_animals_id").optional().isMongoId(),
    utils.errorHandler
];

const validateSearchPostByUser = [
    validator.param("user_id").exists().trim().escape(),
    utils.errorHandler
];

const validateSearchPostById = [
    validator.param("post_id").exists().isMongoId(),
    utils.errorHandler
];

const validatePostByCategory = [
    validator.param("category").exists().trim().escape(),
    validator.query("user_id").optional().isMongoId(),
    utils.errorHandler
];

// const validateUpdateCustomer = [
//     validator.param("username").exists().trim().escape(),
//     validator.body("password").optional().isStrongPassword(),
//     validator.body("email").optional().isEmail().normalizeEmail(),
//     validator.body("name").optional().trim().escape(),
//     validator.body("surname").optional().trim().escape(),
//     validator.body("gender").optional().trim().isIn(["M", "F", "Non-binary", "Altro"]),
//     validator.body("address.city").optional().trim().escape(),
//     validator.body("address.street").optional().trim().escape(),
//     validator.body("address.number").optional().trim().escape(),
//     validator.body("address.postal_code").optional().isPostalCode("any"),
//     validator.body("phone").optional().isMobilePhone("any"),
//     validator.body("role_id").optional().isMongoId(),
//     validator.body("permission").optional(),
//     utils.errorHandler
// ];

// const validateUpdateOperator = [
//     validator.param("username").exists().trim().escape(),
//     validator.body("password").optional().isStrongPassword(),
//     validator.body("email").optional().isEmail().normalizeEmail(),
//     validator.body("name").optional().trim().escape(),
//     validator.body("surname").optional().trim().escape(),
//     validator.body("gender").optional().trim().isIn(["M", "F", "Non-binary", "Altro"]),
//     validator.body("phone").optional().isMobilePhone("any"),
//     validator.body("role_id").optional().isMongoId(),
//     validator.body("permission").optional(),
//     validateWorkingTimeOptional,
//     validateAbsenceTime,
//     utils.errorHandler
// ];

// const validateDeleteUser = [
//     validator.param("username").exists().trim().escape(),
//     utils.errorHandler
// ];

module.exports = {
    validateInsertPost : validateInsertPost,
    validateSearchPostByUser : validateSearchPostByUser,
    validateSearchPostById : validateSearchPostById,
    validatePostByCategory : validatePostByCategory
}