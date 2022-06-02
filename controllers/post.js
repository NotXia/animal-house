require('dotenv').config();
const PostModel = require("../models/blog/post.js");

// Inserimento di un post
async function insertPost(req, res) {
    try {
        const newPost = new PostModel({
            user_id: req.body.user_id,
            content: req.body.content,
            category: req.body.category,
            tag_users_id: req.body.tag_users_id,
            tag_animals_id: req.body.tag_animals_id
        });
        await newPost.save();
    } catch (e) {
        res.sendStatus(500);
    }
    res.sendStatus(200);
}

// Ricerca di tutti i post pubblicati da un dato utente
async function searchPostByUser(req, res) {
    try {
        const posts = await PostModel.find({user_id : req.params.user_id}).exec()
        if (posts.length === 0) { res.sendStatus(404); }
        res.status(200).send(posts);
    } catch (err) {
        res.sendStatus(500);
    }

}

// Ricerca di un singolo post dato l'id
async function searchPostById(req, res) {
    try {
        const post = await PostModel.findById(req.params.post_id, { _id: 1 } ).exec();
        if (!post) { res.sendStatus(404); }
        res.status(200).send(post);
    } catch (err) {
        res.sendStatus(500);
    }
}

// Ricerca di tutti i post data una categoria e un eventuale utente in ordine cronologico
async function searchPostByCategory(req, res) {
    let query_criteria = {};
    query_criteria.category = req.param.category;
    if (req.query.user_id) { query_criteria.user_id = req.query.user_id; }

    try {
        const posts = await PostModel.find(query_criteria).sort({creationDate: "desc"}).exec();
        if (posts.length === 0) { res.sendStatus(404); }
        res.status(200).send(posts);
    } catch (err) {
        res.sendStatus(500);
    }
}

// Modifica di un post dato il suo id
async function updatePost(req, res) {
    const filter = { _id : req.params.post_id }
    try {
        const post = await PostModel.findOneAndUpdate(filter, req.body);
        if (!post) { res.sendStatus(404); }
    } catch (err) {
        res.sendStatus(500);
    }
    res.sendStatus(200);
}

// Cancellazione di un post dato il suo id
async function deletePost(req, res) {
    const filter = { _id : req.params.post_id }
    try {
        const post = await PostModel.findOneAndDelete(filter);
        if (!post) { res.sendStatus(404); }
    } catch (err) {
        res.sendStatus(500);
    }
}

module.exports = {
    insertPost : insertPost,
    searchPostByUser : searchPostByUser,
    searchPostById : searchPostById,
    searchPostByCategory : searchPostByCategory,
    updatePost: updatePost,
    deletePost: deletePost
}