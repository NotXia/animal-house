const { query } = require("express-validator");
const user_validator = require("./validators/user");
const blog_validator = require("./validators/post");
const { REQUIRED, OPTIONAL } = require("./validators/utils");
const utils = require("./utils");

const validateInsertPost = [
    // Lo user_id lo prendo da auth.
    blog_validator.validateContent("body", REQUIRED),
    blog_validator.validateCategory("body", OPTIONAL),
    blog_validator.validateTagUsersId("body", REQUIRED),
    blog_validator.validateTagAnimalsId("body", OPTIONAL),
    utils.validatorErrorHandler
];

const validateSearchPosts = [
    query("page_size").exists().isInt({ min: 1 }).withMessage("Il valore deve essere un intero che inizia da 1"),
    query("page_number").exists().isInt({ min: 0 }).withMessage("Il valore deve essere un intero che inizia da 0"),
    query("oldest").optional().isBoolean().withMessage("Formato non valido"),
    user_validator.validateUsername("query", OPTIONAL),
    blog_validator.validateCategory("query", OPTIONAL),
    utils.validatorErrorHandler
];

const validateSearchPostById = [
    blog_validator.validatePostId("param", REQUIRED),
    utils.validatorErrorHandler
];

const validateUpdatePost = [
    // Lo user_id lo prendo da auth.
    blog_validator.validatePostId("param", REQUIRED),
    blog_validator.validateContent("body", OPTIONAL),
    blog_validator.validateCategory("body", OPTIONAL),
    blog_validator.validateTagUsersId("body", OPTIONAL),
    blog_validator.validateTagAnimalsId("body", OPTIONAL),
    utils.validatorErrorHandler,
    blog_validator.verifyPostOwnership("params")
];

const validateDeletePost = [
    blog_validator.validatePostId("param", REQUIRED),
    utils.validatorErrorHandler,
    blog_validator.verifyPostOwnership("params")
];

const validateInsertComment = [
    blog_validator.validatePostId("param", REQUIRED),
    blog_validator.validateContent("body", REQUIRED),
    utils.validatorErrorHandler
];

const validateSearchCommentByPost = [
    blog_validator.validatePostId("param", REQUIRED),
    utils.validatorErrorHandler
];

const validateSearchCommentByIndex = [
    blog_validator.validatePostId("param", REQUIRED),
    blog_validator.validateCommentIndex("param", REQUIRED),
    utils.validatorErrorHandler
];

const validateUpdateComment = [
    blog_validator.validatePostId("param", REQUIRED),
    blog_validator.validateCommentIndex("param", REQUIRED),
    blog_validator.validateContent("body", REQUIRED),
    utils.validatorErrorHandler,
    blog_validator.verifyCommentOwnership("params", "params")
];

const validateDeleteComment = [
    blog_validator.validatePostId("param", REQUIRED),
    blog_validator.validateCommentIndex("param", REQUIRED),
    utils.validatorErrorHandler,
    blog_validator.verifyCommentOwnership("params", "params")
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