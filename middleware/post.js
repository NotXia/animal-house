const validator = require('express-validator');
const utils = require("./utils");

const validateInsertPost = [
    validator.body("user_id").exists().isMongoId(),
    validator.body("content").exists().escape(),
    validator.body("category").optional().trim().escape(),
    validator.body("tag_users_id").optional().isMongoId(),
    validator.body("tag_animals_id").optional().isMongoId(),
    utils.errorHandler
];

const validateSearchPostByUser = [
    validator.param("user_id").exists().isMongoId(),
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

const validateUpdatePost = [
    validator.param("user_id").exists().isMongoId(),
    validator.body("content").optional().escape(),
    validator.body("category").optional().trim().escape(),
    validator.body("tag_users_id").optional().isMongoId(),
    validator.body("tag_animals_id").optional().isMongoId(),
    utils.errorHandler
];

const validateDeletePost = [
    validator.param("post_id").exists().isMongoId(),
    utils.errorHandler
];

const validateInsertComment = [
    validator.param("post_id").exists().isMongoId(),
    validator.body("content").exists().trim().escape(),
    utils.errorHandler
];

const validateSearchCommentByPost = [
    validator.param("post_id").exists().isMongoId(),
    utils.errorHandler
];

const validateSearchCommentByIndex = [
    validator.param("post_id").exists().isMongoId(),
    validator.param("comment_index").exists().isInt({ min: 0 }),
    utils.errorHandler
];

const validateUpdateComment = [
    validator.param("post_id").exists().isMongoId(),
    validator.param("comment_index").exists().isInt({ min: 0 }),
    validator.body("content").exists().trim().escape(),
    utils.errorHandler
];

// const validateDeleteComment = [
//     validator.param("post_id").exists().isMongoId(),
//     validator.param("comment_index").exists().isInt({ min: 0 }),
//     utils.errorHandler
// ];

module.exports = {
    validateInsertPost: validateInsertPost,
    validateSearchPostByUser: validateSearchPostByUser,
    validateSearchPostById: validateSearchPostById,
    validatePostByCategory: validatePostByCategory,
    validateUpdatePost: validateUpdatePost,
    validateDeletePost: validateDeletePost,
    validateInsertComment: validateInsertComment,
    validateSearchCommentByPost: validateSearchCommentByPost,
    validateSearchCommentByIndex: validateSearchCommentByIndex,
    validateUpdateComment: validateUpdateComment,
    validateDeleteComment: validateDeleteComment
}