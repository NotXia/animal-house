require('dotenv').config();
const PostModel = require("../../models/blog/post");
const TopicModel = require("../../models/blog/topic");

const utils = require("../../utilities");
const error = require("../../error_handler");
const validator = require("express-validator");

/////////////////
// INIZIO POST //
/////////////////

// Inserimento di un post
async function insertPost(req, res) {
    try {
        const topic = await TopicModel.findByName(req.body.topic);
        if (!topic) { throw error.generate.NOT_FOUND("Topic inesistente"); }

        let new_post_fields = validator.matchedData(req);
        new_post_fields.author = req.auth.username; // L'autore si ricava dai dati provenienti dall'autenticazione
        const newPost = await new PostModel(new_post_fields).save();

        return res.status(utils.http.CREATED).location(`${req.baseUrl}/posts/${newPost._id}`).json(newPost.getData());
    } catch (e) {
        return error.response(err, res);
    }
}

// Ricerca di post secondo un criterio
async function searchPosts(req, res) {
    try {
        let query = {};

        // Composizione query di ricerca
        if (req.query.authors) { query.author = { "$in": req.query.authors }; }
        if (req.query.topic) { query.topic = req.query.topic; }

        // Composizione criterio di
        let sort_criteria = { creationDate: "desc" };
        if (req.query.oldest) { sort_criteria = { creationDate: "asc" }; }
    
        let posts = await PostModel.find(query)
                            .sort(sort_criteria)
                            .limit(req.query.page_size)
                            .skip(req.query.page_number)
                            .exec();
        posts = posts.map((post) => post.getData());

        return res.status(utils.http.OK).json(posts);
    }
    catch (err) { 
        return error.response(err, res);
    }
}

// Ricerca di un singolo post dato l'id
async function searchPostById(req, res) {
    try {
        const post = await PostModel.findById(req.params.post_id).exec();
        if (!post) { throw error.generate.NOT_FOUND("Post inesistente"); }
        return res.status(utils.http.OK).json(post.getData());
    } catch (err) {
        return error.response(err, res);
    }
}

// Modifica di un post dato il suo id
async function updatePost(req, res) {
    let updated_post;

    try {
        const updated_fields = validator.matchedData(req, ["body"]);

        // Verifica esistenza del topic
        if (updated_fields.topic) {
            const topic = await TopicModel.findByName(updated_fields.topic);
            if (!topic) { throw error.generate.NOT_FOUND("Topic inesistente"); }
        }

        updated_post = await PostModel.findOneAndUpdate({ _id: req.params.post_id }, updated_fields, { new: true });
        if (!updated_post) { throw error.generate.NOT_FOUND("Post inesistente"); }
    } catch (err) {
        return error.response(err, res);
    }
    return res.status(utils.http.OK).json(updated_post.getData());
}

// Cancellazione di un post dato il suo id
async function deletePost(req, res) {
    const filter = { _id : req.params.post_id };
    try {
        const post = await PostModel.findOneAndDelete(filter);
        if (!post) { throw error.generate.NOT_FOUND("Post inesistente"); }
        return res.sendStatus(utils.http.NO_CONTENT);
    } catch (err) {
        return error.response(err, res);
    }
}

/////////////////////
// INIZIO COMMENTI //
/////////////////////

// Inserimento di un commento dato un post
async function insertComment(req, res) {
    let updated_post;
    const comment = {
        author : req.auth.username, // Autore del commento estratto dai dati di autenticazione
        content : req.body.content
    };
    try {
        updated_post = await PostModel.findByIdAndUpdate(req.params.post_id, { $push : { comments : comment } }, { new: true });
        if (!updated_post) { throw error.generate.NOT_FOUND("Post inesistente"); }
    } catch (err) {
        return error.response(err, res);
    }
    return res.status(utils.http.CREATED)
                .location(`${req.baseUrl}/posts/${req.params.post_id}/comments/${updated_post.comments.length-1}`)
                .json( updated_post.getCommentByIndexData(updated_post.comments.length-1) );
}

// Ricerca dei commenti dato un id di un post
async function searchCommentsByPost(req, res) {
    try {
        const to_skip = parseInt(req.query.page_size) * parseInt(req.query.page_number);
        const post = await PostModel.findById(req.params.post_id, { comments: {"$slice": [to_skip, parseInt(req.query.page_size)]} }).exec();
        if (!post) { throw error.generate.NOT_FOUND("Post inesistente"); }

        let comments = post.comments.map((_, index) => post.getCommentByIndexData(index, to_skip+index));
        return res.status(utils.http.OK).json(comments);
    } catch (err) {
        console.warn(err);
        return error.response(err, res);
    }
}

// Ricerca di un commento dato un id di un post e la posizione del commento nell'array
async function searchCommentByIndex(req, res) {
    try {
        const post = await PostModel.findById(req.params.post_id).exec();
        if (!post) { throw error.generate.NOT_FOUND("Post inesistente"); }
        if (!post.comments[parseInt(req.params.comment_index)]) { throw error.generate.NOT_FOUND("Commento inesistente"); }

        return res.status(utils.http.OK).json(post.getCommentByIndexData(parseInt(req.params.comment_index)));
    } catch (err) {
        return error.response(err, res);
    }
}

// Modifica di un commento dato un id di un post e la posizione del commento nell'array
async function updateComment(req, res) {
    let updated_comment;
    const newComment = {
        author: req.auth.username,
        content: req.body.content,
        updateDate: new Date()
    };

    try {
        const post = await PostModel.findById(req.params.post_id, { comments: 1 }).exec();
        if (!post) { throw error.generate.NOT_FOUND("Post inesistente"); }
        if (!post.comments[parseInt(req.params.comment_index)]) { throw error.generate.NOT_FOUND("Commento inesistente"); }

        const updated_post = await PostModel.findByIdAndUpdate(req.params.post_id, { [`comments.${req.params.comment_index}`]: newComment }, { new: true });
        updated_comment = updated_post.getCommentByIndexData(parseInt(req.params.comment_index));
    } catch (err) {
        return error.response(err, res);
    }

    return res.status(utils.http.OK).json(updated_comment);
}

// Cancellazione di un commento dato un id di un post e la posizione del commento nell'array
async function deleteComment(req, res) {
    try {
        const post = await PostModel.findById(req.params.post_id, { comments: 1 }).exec();
        if (!post) { throw error.generate.NOT_FOUND("Post inesistente"); }
        if (!post.comments[parseInt(req.params.comment_index)]) { throw error.generate.NOT_FOUND("Commento inesistente"); }

        // Rimozione del commento (workaround per eliminare un elemento per indice)
        await PostModel.findByIdAndUpdate(req.params.post_id, { $unset: { [`comments.${req.params.comment_index}`]: 1 } });
        await PostModel.findByIdAndUpdate(req.params.post_id, { $pull: { comments: null } });
    } catch (err) {
        return error.response(err, res);
    }
    
    return res.sendStatus(utils.http.NO_CONTENT);
}

module.exports = {
    insertPost: insertPost,
    searchPosts: searchPosts,
    searchPostById: searchPostById,
    updatePost: updatePost,
    deletePost: deletePost,
    insertComment: insertComment,
    searchCommentsByPost: searchCommentsByPost,
    searchCommentByIndex: searchCommentByIndex,
    updateComment: updateComment,
    deleteComment: deleteComment
}
