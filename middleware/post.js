const { query } = require("express-validator");
const validator = require("./validators/post");
const { REQUIRED, OPTIONAL } = require("./validators/utils");
const utils = require("./utils");

const validateInsertPost = [
    // Lo user_id lo prendo da auth.
    validator.validateContent("body", REQUIRED),
    validator.validateCategory("body", OPTIONAL),
    validator.validateTagUsersId("body", REQUIRED),
    validator.validateTagAnimalsId("body", OPTIONAL),
    utils.validatorErrorHandler
];

const validateSearchPosts = [
    query("page_size").exists().isInt({ min: 1 }).withMessage("Il valore deve essere un intero che inizia da 1"),
    query("page_number").exists().isInt({ min: 0 }).withMessage("Il valore deve essere un intero che inizia da 0"),
    query("oldest").optional().isBoolean().withMessage("Formato non valido"),
    validator.validateUsername("query", OPTIONAL),
    validator.validateCategory("query", OPTIONAL),
    utils.validatorErrorHandler
];

const validateSearchPostById = [
    validator.validatePostId("param", REQUIRED),
    utils.validatorErrorHandler
];

const validateUpdatePost = [
    // Lo user_id lo prendo da auth.
    validator.validatePostId("param", REQUIRED),
    validator.validateContent("body", OPTIONAL),
    validator.validateCategory("body", OPTIONAL),
    validator.validateTagUsersId("body", OPTIONAL),
    validator.validateTagAnimalsId("body", OPTIONAL),
    utils.validatorErrorHandler,
    validator.verifyPostOwnership("params")
];

const validateDeletePost = [
    validator.validatePostId("param", REQUIRED),
    utils.validatorErrorHandler,
    validator.verifyPostOwnership("params")
];

const validateInsertComment = [
    validator.validatePostId("param", REQUIRED),
    validator.validateContent("body", REQUIRED),
    utils.validatorErrorHandler
];

const validateSearchCommentByPost = [
    validator.validatePostId("param", REQUIRED),
    utils.validatorErrorHandler
];

const validateSearchCommentByIndex = [
    validator.validatePostId("param", REQUIRED),
    validator.validateCommentIndex("param", REQUIRED),
    utils.validatorErrorHandler
];

const validateUpdateComment = [
    validator.validatePostId("param", REQUIRED),
    validator.validateCommentIndex("param", REQUIRED),
    validator.validateContent("body", REQUIRED),
    utils.validatorErrorHandler,
    validator.verifyCommentOwnership("params", "params")
];

const validateDeleteComment = [
    validator.validatePostId("param", REQUIRED),
    validator.validateCommentIndex("param", REQUIRED),
    utils.validatorErrorHandler,
    validator.verifyCommentOwnership("params", "params")
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