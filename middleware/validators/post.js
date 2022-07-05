const validator = require("express-validator");
const utils = require("./utils");
const error = require("../../error_handler");
const PostModel = require("../../models/blog/post");

module.exports.validateUsername = (source, required = true, field_name = "username") => { return utils.handleRequired(validator[source](field_name), required).notEmpty().withMessage("Valore mancante").trim().escape(); }
module.exports.validatePostId = (source, required = true, field_name = "post_id") => { return utils.handleRequired(validator[source](field_name), required).isMongoId().withMessage("Formato non valido"); }
module.exports.validateContent = (source, required = true, field_name = "content") => { return utils.handleRequired(validator[source](field_name), required).escape(); }
module.exports.validateCategory = (source, required = true, field_name = "category") => { return utils.handleRequired(validator[source](field_name), required).notEmpty().withMessage("Valore mancante").trim().escape(); }
module.exports.validateTagUsersId = (source, required = true, field_name = "tag_users_id.*") => { return utils.handleRequired(validator[source](field_name), required).isMongoId().withMessage("Formato non valido"); }
module.exports.validateTagAnimalsId = (source, required = true, field_name = "tag_animals_id.*") => { return utils.handleRequired(validator[source](field_name), required).isMongoId().withMessage("Formato non valido"); }
module.exports.validateCommentIndex = (source, required = true, field_name = "comment_index") => { return utils.handleRequired(validator[source](field_name), required).isInt({ min: 0 }).withMessage("Il valore deve essere un intero che inizia da 0"); }

/**
 * Verifica i permessi per effettuare operazioni sull'oggetto
 */
module.exports.verifyPostOwnership = function(source) {
    return async function (req, res, next) {
        if (req.auth.superuser) { return next(); }

        const post_id = req[source].post_id;
        const post = await PostModel.findById(post_id, { user_id: 1 }).populate("user_id").exec();

        if (!post) { return next(error.generate.NOT_FOUND()); }
        if (post.user_id.username === req.auth.username) { return next(); }
        return next(error.generate.FORBIDDEN("Non sei il proprietario"));
    }
}

/**
 * Verifica i permessi per effettuare operazioni sull'oggetto
 */
module.exports.verifyCommentOwnership = function (post_id_source, comment_index_source) {
    return async function (req, res, next) {
        if (req.auth.superuser) { return next(); }

        const post_id = req[post_id_source].post_id;
        const comment_index = req[comment_index_source].comment_index;
        const post = await PostModel.findById(post_id, { comments: 1 }).populate("comments.user_id").exec();

        if (!post || !post.comments[comment_index]) { return next(error.generate.NOT_FOUND()); }
        if (post.comments[comment_index].user_id.username === req.auth.username) { return next(); }
        return next(error.generate.FORBIDDEN("Non sei il proprietario"));
    }
}