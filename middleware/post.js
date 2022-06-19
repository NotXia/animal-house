const validator = require('express-validator');
const utils = require("./utils");
const { error } = require("../utilities");
const PostModel = require("../models/blog/post");

function validateUsername(source)       { return source("username").trim().escape(); }
function validatePostId(source)         { return source("post_id").isMongoId(); }
function validateContent(source)        { return source("content").escape(); }
function validateCategory(source)       { return source("category").trim().escape(); }
function validateTagUsersId(source)     { return source("tag_users_id.*").isMongoId(); }
function validateTagAnimalsId(source)   { return source("tag_animals_id.*").isMongoId(); }
function validateCommentIndex(source)   { return source("comment_index").isInt({ min: 0 }); }


/**
 * Verifica i permessi per effettuare operazioni sull'oggetto
 */
function verifyPostOwnership(source) {
    return async function (req, res, next) {
        if (req.auth.superuser) { return next(); }

        const post_id = req[source].post_id;
        const post = await PostModel.findById(post_id, { user_id: 1 }).populate("user_id").exec();
        
        if (!post) { return next(error.NOT_FOUND()); }
        if (post.user_id.username === req.auth.username) { return next(); }
        return next(error.FORBIDDEN("Non sei il proprietario"));
    }
}

/**
 * Verifica i permessi per effettuare operazioni sull'oggetto
 */
function verifyCommentOwnership(post_id_source, comment_index_source) {
    return async function (req, res, next) {
        if (req.auth.superuser) { return next(); }

        const post_id = req[post_id_source].post_id;
        const comment_index = req[comment_index_source].comment_index;
        const post = await PostModel.findById(post_id, { comments: 1 }).populate("comments.user_id").exec();

        if (!post || !post.comments[comment_index]) { return next(error.NOT_FOUND()); }
        if (post.comments[comment_index].user_id.username === req.auth.username) { return next(); }
        return next(error.FORBIDDEN("Non sei il proprietario"));
    }
}


const validateInsertPost = [
    // validator.body("user_id").exists().isMongoId(), // Lo user_id lo prendo da auth.
    validateContent(validator.body).exists(),
    validateCategory(validator.body).optional(),
    validateTagUsersId(validator.body).exists(),
    validateTagAnimalsId(validator.body).optional(),
    utils.validatorErrorHandler
];

const validateSearchPosts = [
    validator.query("page_size").exists().isInt({ min: 1 }),
    validator.query("page_number").exists().isInt({ min: 0 }),
    validator.query("oldest").optional().isBoolean(),
    validateUsername(validator.query).optional(),
    validateCategory(validator.query).optional(),
    utils.validatorErrorHandler
];

const validateSearchPostById = [
    validatePostId(validator.param).exists(),
    utils.validatorErrorHandler
];

const validateUpdatePost = [
    // validator.param("user_id").exists().isMongoId(), // Lo user_id lo prendo da auth.
    validatePostId(validator.param).exists(),
    validateContent(validator.body).optional(),
    validateCategory(validator.body).optional(),
    validateTagUsersId(validator.body).optional(),
    validateTagAnimalsId(validator.body).optional(),
    utils.validatorErrorHandler,
    verifyPostOwnership("params")
];

const validateDeletePost = [
    validatePostId(validator.param).exists(),
    utils.validatorErrorHandler,
    verifyPostOwnership("params")
];

const validateInsertComment = [
    validatePostId(validator.param).exists(),
    validateContent(validator.body).exists(),
    utils.validatorErrorHandler
];

const validateSearchCommentByPost = [
    validatePostId(validator.param).exists(),
    utils.validatorErrorHandler
];

const validateSearchCommentByIndex = [
    validatePostId(validator.param).exists(),
    validateCommentIndex(validator.param).exists(),
    utils.validatorErrorHandler
];

const validateUpdateComment = [
    validatePostId(validator.param).exists(),
    validateCommentIndex(validator.param).exists(),
    validateContent(validator.body).exists(),
    utils.validatorErrorHandler,
    verifyCommentOwnership("params", "params")
];

const validateDeleteComment = [
    validatePostId(validator.param).exists(),
    validateCommentIndex(validator.param).exists(),
    utils.validatorErrorHandler,
    verifyCommentOwnership("params", "params")
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