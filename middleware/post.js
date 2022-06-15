const validator = require('express-validator');
const utils = require("./utils");
const { error } = require("../utilities");
const PostModel = require("../models/blog/post");

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
    validator.param("post_id").exists().isMongoId(),
    validator.body("content").optional().escape(),
    validator.body("category").optional().trim().escape(),
    validator.body("tag_users_id").optional().isMongoId(),
    validator.body("tag_animals_id").optional().isMongoId(),
    verifyPostOwnership("params"),
    utils.errorHandler
];

const validateDeletePost = [
    validator.param("post_id").exists().isMongoId(),
    verifyPostOwnership("params"),
    utils.errorHandler,
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
    verifyCommentOwnership("params", "params"),
    utils.errorHandler
];

const validateDeleteComment = [
    validator.param("post_id").exists().isMongoId(),
    validator.param("comment_index").exists().isInt({ min: 0 }),
    verifyCommentOwnership("params", "params"),
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