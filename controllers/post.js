require('dotenv').config();
const PostModel = require("../models/blog/post.js");
const OperatorModel = require("../models/auth/operator");
const UserModel = require("../models/auth/user");
const mongoose = require("mongoose");

/////////////////
// INIZIO POST //
/////////////////

// Inserimento di un post
async function insertPost(req, res) {
    try {
        const newPost = new PostModel({
            user_id: req.auth.id,
            content: req.body.content,
            category: req.body.category,
            tag_users_id: req.body.tag_users_id,
            tag_animals_id: req.body.tag_animals_id
        });
        await newPost.save();
        return res.status(201).location(`${req.baseUrl}/posts/${newPost._id}`).send(newPost);
    } catch (e) {
        return res.sendStatus(500);
    }
}

// Ricerca di post secondo un criterio
async function searchPosts(req, res) {
    let query = {};
    if (req.query.username) { query.username = req.query.username; }
    if (req.query.username) { query.category = req.query.category; }

    const posts = await PostModel.find(query)
                        .sort({ creationDate: "desc" })
                        .limit(req.query.page_size)
                        .skip(req.query.page_number)
                        .exec()
                        .catch(function (err) { return res.sendStatus(500); });
    if (posts.length === 0) { return res.sendStatus(404); }
    return res.status(200).send(posts);
}

// Ricerca di un singolo post dato l'id
async function searchPostById(req, res) {
    try {
        const post = await PostModel.findById(req.params.post_id).exec();
        if (!post) { return res.sendStatus(404); }
        return res.status(200).send(post);
    } catch (err) {
        return res.sendStatus(500);
    }
}

// Modifica di un post dato il suo id
async function updatePost(req, res) {
    const filter = { _id : req.params.post_id };
    try {
        const post = await PostModel.findOneAndUpdate(filter, req.body);
        if (!post) { return res.sendStatus(404); }
    } catch (err) {
        return res.sendStatus(500);
    }
    return res.sendStatus(200);
}

// Cancellazione di un post dato il suo id
async function deletePost(req, res) {
    const filter = { _id : req.params.post_id };
    try {
        const post = await PostModel.findOneAndDelete(filter);
        if (!post) { return res.sendStatus(404); }
        return res.sendStatus(200);
    } catch (err) {
        return res.sendStatus(500);
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
        if (!post) { return res.sendStatus(404); }
    } catch (err) {
        return res.sendStatus(500);
    }
    return res.sendStatus(201);
}

// Ricerca dei commenti dato un id di un post
async function searchCommentByPost(req, res) {
    try {
        const post = await PostModel.findById(req.params.post_id).exec();
        if (!post) { return res.sendStatus(404); }
        return res.status(200).send(post.comments);
    } catch (err) {
        return res.sendStatus(500);
    }
}

// Ricerca di un commento dato un id di un post e la posizione del commento nell'array
async function searchCommentByIndex(req, res) {
    try {
        const post = await PostModel.findById(req.params.post_id).exec();
        if (!post) { return res.sendStatus(404); }
        return res.status(200).send(post.comments[parseInt(req.params.comment_index)]);
    } catch (err) {
        return res.sendStatus(500);
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
        if (!post || !post.comments[parseInt(req.params.comment_index)]) { return res.sendStatus(404); }

        await PostModel.findByIdAndUpdate(req.params.post_id, { [`comments.${req.params.comment_index}`]: newComment });
        
        await session.commitTransaction();
        session.endSession();
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        return res.sendStatus(500);
    }
    return res.sendStatus(200);
}

// Cancellazione di un commento dato un id di un post e la posizione del commento nell'array
async function deleteComment(req, res) {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const post = await PostModel.findById(req.params.post_id, { comments: 1 }).exec();
        if (!post || !post.comments[parseInt(req.params.comment_index)]) { return res.sendStatus(404); }

        // Rimozione del commento (workaround per eliminare un elemento per indice)
        await PostModel.findByIdAndUpdate(req.params.post_id, { $unset: { [`comments.${req.params.comment_index}`]: 1 } });
        await PostModel.findByIdAndUpdate(req.params.post_id, { $pull: { comments: null } });

        await session.commitTransaction();
        session.endSession();
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        return res.sendStatus(500);
    }
    return res.sendStatus(200);
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