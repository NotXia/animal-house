const validator = require('express-validator');
const utils = require("./utils");

const validateInsertPost = [
    // validator.body("user_id").exists().isMongoId(), // Lo user_id lo prendo da auth.
    validator.body("content").exists().escape(),
    validator.body("category").optional().trim().escape(),
    validator.body("tag_users_id").optional().isMongoId(),
    validator.body("tag_animals_id").optional().isMongoId(),
    utils.errorHandler
];

const validateSearchPosts = [
    validator.query("page_size").exists().isInt({ min: 1 }),
    validator.query("page_number").exists().isInt({ min: 0 }),
    validator.query("username").optional().trim().escape(),
    validator.query("category").optional().trim().escape(),
    validator.query("oldest").optional().isBoolean(),
    utils.errorHandler
];

const validateSearchPostById = [
    validator.param("post_id").exists().isMongoId(),
    utils.errorHandler
];

const validateUpdatePost = [
    // validator.param("user_id").exists().isMongoId(), // Lo user_id lo prendo da auth.
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

const validateDeleteComment = [
    validator.param("post_id").exists().isMongoId(),
    validator.param("comment_index").exists().isInt({ min: 0 }),
    utils.errorHandler
];

module.exports = {
    validateInsertPost: validateInsertPost,
    validateSearchPosts: validateSearchPosts,
    validateSearchPostById: validateSearchPostById,
    validateUpdatePost: validateUpdatePost,
    validateDeletePost: validateDeletePost,
    validateInsertComment: validateInsertComment,
    validateSearchCommentByPost: validateSearchCommentByPost,
    validateSearchCommentByIndex: validateSearchCommentByIndex,
    validateUpdateComment: validateUpdateComment,
    validateDeleteComment: validateDeleteComment
}