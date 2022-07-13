require('dotenv').config();
const PostModel = require("../../models/blog/post");
const TopicModel = require("../../models/blog/topic");
const UserModel = require("../../models/auth/user");
const mongoose = require("mongoose");

const utils = require("../../utilities");
const error = require("../../error_handler");
const validator = require("express-validator");

/////////////////
// INIZIO POST //
/////////////////

// Inserimento di un post
async function insertPost(req, res) {
    try {
        const topic_id = (await TopicModel.findByName(req.body.topic))._id;
        if (!topic_id) { return res.satus(utils.http.NOT_FOUND).json(error.formatMessage("Argomento non valido")); }

        const newPost = new PostModel({
            user_id: req.auth.id,
            content: req.body.content,
            topic_id: topic_id,
            tag_users_id: req.body.tag_users_id,
            tag_animals_id: req.body.tag_animals_id
        });
        await newPost.save();
        return res.status(utils.http.CREATED).location(`${req.baseUrl}/posts/${newPost._id}`).json(newPost);
    } catch (e) {
        return res.sendStatus(utils.http.INTERNAL_SERVER_ERROR);
    }
}

// Ricerca di post secondo un criterio
async function searchPosts(req, res) {
    try {
        let query = {};

        // Estrae l'id dell'utente a partire dallo username
        if (req.query.username) {
            const user = await UserModel.findOne({ username: req.query.username }, { _id: 1 }).exec();
            if (!user) { return res.status(utils.http.NOT_FOUND).json(error.formatMessage("Utente inesistente")); }
            query.user_id = user._id;
        }
        // Estrae l'id del topic a partire dal nome
        if (req.query.topic) { 
            const topic_id = (await TopicModel.findByName(req.body.topic))._id;
            if (!topic_id) { return res.satus(utils.http.NOT_FOUND).json(error.formatMessage("Argomento non valido")); }
            query.topic_id = topic_id; 
        }
        
        let sort_criteria = { creationDate: "desc" };
        if (req.query.oldest) { sort_criteria = { creationDate: "asc" }; }
    
        const posts = await PostModel.find(query)
                            .sort(sort_criteria)
                            .limit(req.query.page_size)
                            .skip(req.query.page_number)
                            .exec()
        if (posts.length === 0) { return res.status(utils.http.NOT_FOUND).json(error.formatMessage(utils.http.NOT_FOUND)); }
        return res.status(utils.http.OK).json(posts);
    }
    catch(err) {
        return res.sendStatus(utils.http.INTERNAL_SERVER_ERROR);
    }
}

// Ricerca di un singolo post dato l'id
async function searchPostById(req, res) {
    try {
        const post = await PostModel.findById(req.params.post_id).exec();
        if (!post) { return res.status(utils.http.NOT_FOUND).json(error.formatMessage(utils.http.NOT_FOUND)); }
        return res.status(utils.http.OK).json(post);
    } catch (err) {
        return res.sendStatus(utils.http.INTERNAL_SERVER_ERROR);
    }
}

// Modifica di un post dato il suo id
async function updatePost(req, res) {
    try {
        const updated_fields = validator.matchedData(req);

        // Estrae l'id del topic
        if (updated_fields.topic) {
            const topic_id = (await TopicModel.findByName(updated_fields.topic))._id;
            if (!topic_id) { return res.satus(utils.http.NOT_FOUND).json(error.formatMessage("Argomento non valido")); }

            updated_fields.topic_id = topic_id;
            delete updated_fields.topic;
        }

        const post = await PostModel.findOneAndUpdate({ _id: req.params.post_id }, updated_fields);
        if (!post) { return res.status(utils.http.NOT_FOUND).json(error.formatMessage(utils.http.NOT_FOUND)); }
    } catch (err) {
        return res.sendStatus(utils.http.INTERNAL_SERVER_ERROR);
    }
    return res.sendStatus(utils.http.OK);
}

// Cancellazione di un post dato il suo id
async function deletePost(req, res) {
    const filter = { _id : req.params.post_id };
    try {
        const post = await PostModel.findOneAndDelete(filter);
        if (!post) { return res.status(utils.http.NOT_FOUND).json(error.formatMessage(utils.http.NOT_FOUND)); }
        return res.sendStatus(utils.http.OK);
    } catch (err) {
        return res.sendStatus(utils.http.INTERNAL_SERVER_ERROR);
    }
}

/////////////////////
// INIZIO COMMENTI //
/////////////////////

// Inserimento di un commento dato un post
async function insertComment(req, res) {
    const comment = {
        user_id : req.auth.id,
        content : req.body.content
    };
    try {
        const post = await PostModel.findByIdAndUpdate(req.params.post_id, { $push : { comments : comment } });
        if (!post) { return res.status(utils.http.NOT_FOUND).json(error.formatMessage(utils.http.NOT_FOUND)); }
    } catch (err) {
        return res.sendStatus(utils.http.INTERNAL_SERVER_ERROR);
    }
    return res.sendStatus(utils.http.CREATED);
}

// Ricerca dei commenti dato un id di un post
async function searchCommentByPost(req, res) {
    try {
        const post = await PostModel.findById(req.params.post_id).exec();
        if (!post) { return res.status(utils.http.NOT_FOUND).json(error.formatMessage(utils.http.NOT_FOUND)); }
        return res.status(utils.http.OK).json(post.comments);
    } catch (err) {
        return res.sendStatus(utils.http.INTERNAL_SERVER_ERROR);
    }
}

// Ricerca di un commento dato un id di un post e la posizione del commento nell'array
async function searchCommentByIndex(req, res) {
    try {
        const post = await PostModel.findById(req.params.post_id).exec();
        if (!post) { return res.status(utils.http.NOT_FOUND).json(error.formatMessage(utils.http.NOT_FOUND)); }
        return res.status(utils.http.OK).json(post.comments[parseInt(req.params.comment_index)]);
    } catch (err) {
        return res.sendStatus(utils.http.INTERNAL_SERVER_ERROR);
    }
}

// Modifica di un commento dato un id di un post e la posizione del commento nell'array
async function updateComment(req, res) {
    const session = await mongoose.startSession();
    const newComment = {
        user_id: req.auth.id,
        content: req.body.content,
        updateDate: new Date()
    };
    try {
        session.startTransaction();
        const post = await PostModel.findById(req.params.post_id, { comments: 1 }).exec();
        if (!post || !post.comments[parseInt(req.params.comment_index)]) { return res.status(utils.http.NOT_FOUND).json(error.formatMessage(utils.http.NOT_FOUND)); }

        await PostModel.findByIdAndUpdate(req.params.post_id, { [`comments.${req.params.comment_index}`]: newComment });
        
        await session.commitTransaction();
        session.endSession();
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        return res.sendStatus(utils.http.INTERNAL_SERVER_ERROR);
    }
    return res.sendStatus(utils.http.OK);
}

// Cancellazione di un commento dato un id di un post e la posizione del commento nell'array
async function deleteComment(req, res) {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const post = await PostModel.findById(req.params.post_id, { comments: 1 }).exec();
        if (!post || !post.comments[parseInt(req.params.comment_index)]) { return res.status(utils.http.NOT_FOUND).json(error.formatMessage(utils.http.NOT_FOUND)); }

        // Rimozione del commento (workaround per eliminare un elemento per indice)
        await PostModel.findByIdAndUpdate(req.params.post_id, { $unset: { [`comments.${req.params.comment_index}`]: 1 } });
        await PostModel.findByIdAndUpdate(req.params.post_id, { $pull: { comments: null } });

        await session.commitTransaction();
        session.endSession();
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        return res.sendStatus(utils.http.INTERNAL_SERVER_ERROR);
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
