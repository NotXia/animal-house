const validator = require("express-validator");
const utils = require("./utils");
const error = require("../../error_handler");
const PostModel = require("../../models/blog/post");
const user_validator = require("./user");

module.exports.validatePostId =       (source, required=true, field_name="post_id") => { return utils.handleRequired(validator[source](field_name), required).isMongoId().withMessage("Formato non valido"); }
module.exports.validateAuthor =       (source, required=true, field_name="author") => { return user_validator.validateUsername(source, required, field_name); }
module.exports.validateContent =      (source, required=true, field_name="content") => { return utils.handleRequired(validator[source](field_name), required).escape(); }
module.exports.validateTagUsers =     (source, required=true, field_name="tag_users.*") => { return user_validator.validateUsername(source, required, field_name); }
module.exports.validateTagAnimalsId = (source, required=true, field_name="tag_animals_id.*") => { return utils.handleRequired(validator[source](field_name), required).isMongoId().withMessage("Formato non valido"); }
module.exports.validateCommentIndex = (source, required=true, field_name="comment_index") => { return utils.handleRequired(validator[source](field_name), required).isInt({ min: 0 }).withMessage("Il valore deve essere un intero che inizia da 0"); }

module.exports.validateTopicName = (source, required=true, field_name="name") => { return utils.handleRequired(validator[source](field_name), required).notEmpty().withMessage("Valore mancante").trim().escape(); }
module.exports.validateTopicIcon = (source, required=true, field_name="icon") => { return utils.handleRequired(validator[source](field_name), required).isBase64().withMessage("Formato non valido"); }


/**
 * Verifica i permessi per effettuare operazioni sull'oggetto
 */
module.exports.verifyPostOwnership = function(source) {
    return async function (req, res, next) {
        if (req.auth.superuser) { return next(); }

        const post_id = req[source].post_id;
        const post = await PostModel.findById(post_id).exec();
        if (!post) { return next(error.generate.NOT_FOUND()); }

        if (post.author === req.auth.username) { return next(); }
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
        const post = await PostModel.findById(post_id).exec();
        if (!post || !post.comments[comment_index]) { return next(error.generate.NOT_FOUND()); }

        if (post.comments[comment_index].author === req.auth.username) { return next(); }
        return next(error.generate.FORBIDDEN("Non sei il proprietario"));
    }
}