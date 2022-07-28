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
        new_post_fields. author = req.auth.username; // L'autore si ricava dai dati provenienti dall'autenticazione
        const newPost = await new PostModel(new_post_fields).save();

        return res.status(utils.http.CREATED).location(`${req.baseUrl}/posts/${newPost._id}`).json(newPost);
    } catch (e) {
        return error.response(err, res);
    }
}

// Ricerca di post secondo un criterio
async function searchPosts(req, res) {
    try {
        let query = {};

        // Composizione query di ricerca
        if (req.query.author) { query.author = req.query.author; }
        if (req.query.topic) { query.topic = req.query.topic; }
        
        // Composizione criterio di
        let sort_criteria = { creationDate: "desc" };
        if (req.query.oldest) { sort_criteria = { creationDate: "asc" }; }
    
        const posts = await PostModel.find(query)
                            .sort(sort_criteria)
                            .limit(req.query.page_size)
                            .skip(req.query.page_number)
                            .exec();
                            
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
        return res.status(utils.http.OK).json(post);
    } catch (err) {
        return error.response(err, res);
    }
}

// Modifica di un post dato il suo id
async function updatePost(req, res) {
    try {
        const updated_fields = validator.matchedData(req, ["body"]);

        // Verifica esistenza del topic
        if (updated_fields.topic) {
            const topic = await TopicModel.findByName(updated_fields.topic);
            if (!topic) { throw error.generate.NOT_FOUND("Topic inesistente"); }
        }

        const post = await PostModel.findOneAndUpdate({ _id: req.params.post_id }, updated_fields);
        if (!post) { throw error.generate.NOT_FOUND("Post inesistente"); }
    } catch (err) {
        return error.response(err, res);
    }
    return res.sendStatus(utils.http.OK);
}

// Cancellazione di un post dato il suo id
async function deletePost(req, res) {
    const filter = { _id : req.params.post_id };
    try {
        const post = await PostModel.findOneAndDelete(filter);
        if (!post) { throw error.generate.NOT_FOUND("Post inesistente"); }
        return res.sendStatus(utils.http.OK);
    } catch (err) {
        return error.response(err, res);
    }
}

/////////////////////
// INIZIO COMMENTI //
/////////////////////

// Inserimento di un commento dato un post
async function insertComment(req, res) {
    const comment = {
        author : req.auth.username, // Autore del commento estratto dai dati di autenticazione
        content : req.body.content
    };
    try {
        const post = await PostModel.findByIdAndUpdate(req.params.post_id, { $push : { comments : comment } });
        if (!post) { throw error.generate.NOT_FOUND("Post inesistente"); }
    } catch (err) {
        return error.response(err, res);
    }
    return res.sendStatus(utils.http.CREATED);
}

// Ricerca dei commenti dato un id di un post
async function searchCommentByPost(req, res) {
    try {
        const post = await PostModel.findById(req.params.post_id).exec();
        if (!post) { throw error.generate.NOT_FOUND("Post inesistente"); }
        return res.status(utils.http.OK).json(post.comments);
    } catch (err) {
        return error.response(err, res);
    }
}

// Ricerca di un commento dato un id di un post e la posizione del commento nell'array
async function searchCommentByIndex(req, res) {
    try {
        const post = await PostModel.findById(req.params.post_id).exec();
        if (!post) { throw error.generate.NOT_FOUND("Post inesistente"); }
        if (!post.comments[parseInt(req.params.comment_index)]) { throw error.generate.NOT_FOUND("Commento inesistente"); }
        return res.status(utils.http.OK).json(post.comments[parseInt(req.params.comment_index)]);
    } catch (err) {
        return error.response(err, res);
    }
}

// Modifica di un commento dato un id di un post e la posizione del commento nell'array
async function updateComment(req, res) {
    const newComment = {
        author: req.auth.username,
        content: req.body.content,
        updateDate: new Date()
    };

    try {
        const post = await PostModel.findById(req.params.post_id, { comments: 1 }).exec();
        if (!post) { throw error.generate.NOT_FOUND("Post inesistente"); }
        if (!post.comments[parseInt(req.params.comment_index)]) { throw error.generate.NOT_FOUND("Commento inesistente"); }

        await PostModel.findByIdAndUpdate(req.params.post_id, { [`comments.${req.params.comment_index}`]: newComment });
    } catch (err) {
        return error.response(err, res);
    }

    return res.sendStatus(utils.http.OK);
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
    
    return res.sendStatus(utils.http.OK);
}

module.exports = {
    insertPost: insertPost,
    searchPosts: searchPosts,
    searchPostById: searchPostById,
    updatePost: updatePost,
    deletePost: deletePost,
    insertComment: insertComment,
    searchCommentByPost: searchCommentByPost,
    searchCommentByIndex: searchCommentByIndex,
    updateComment: updateComment,
    deleteComment: deleteComment
}
