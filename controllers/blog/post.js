require('dotenv').config();
const PostModel = require("../../models/blog/post");
const TopicModel = require("../../models/blog/topic");
const UserModel = require("../../models/auth/user");

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

        const newPost = new PostModel({
            user_id: req.auth.id,
            content: req.body.content,
            topic_id: topic._id,
            tag_users_id: req.body.tag_users_id,
            tag_animals_id: req.body.tag_animals_id
        });
        await newPost.save();
        return res.status(utils.http.CREATED).location(`${req.baseUrl}/posts/${newPost._id}`).json(newPost);
    } catch (e) {
        return error.response(err, res);
    }
}

// Ricerca di post secondo un criterio
async function searchPosts(req, res) {
    try {
        let query = {};

        // Estrae l'id dell'utente a partire dallo username
        if (req.query.username) {
            const user = await UserModel.findOne({ username: req.query.username }, { _id: 1 }).exec();
            if (!user) { throw error.generate.NOT_FOUND("Utente inesistente"); }
            query.user_id = user._id;
        }
        // Estrae l'id del topic a partire dal nome
        if (req.query.topic) { 
            const topic = await TopicModel.findByName(req.body.topic);
            if (!topic) { throw error.generate.NOT_FOUND("Topic inesistente"); }
            query.topic_id = topic._id; 
        }
        
        let sort_criteria = { creationDate: "desc" };
        if (req.query.oldest) { sort_criteria = { creationDate: "asc" }; }
    
        const posts = await PostModel.find(query)
                            .sort(sort_criteria)
                            .limit(req.query.page_size)
                            .skip(req.query.page_number)
                            .exec();
        if (posts.length === 0) { throw error.generate.NOT_FOUND("Nessun post soddisfa i criteri di ricerca"); }
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
        const updated_fields = validator.matchedData(req);

        // Estrae l'id del topic
        if (updated_fields.topic) {
            const topic = await TopicModel.findByName(updated_fields.topic);
            if (!topic) { throw error.generate.NOT_FOUND("Topic inesistente"); }
            updated_fields.topic_id = topic._id;
            delete updated_fields.topic;
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
        user_id : req.auth.id,
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
        return res.status(utils.http.OK).json(post.comments[parseInt(req.params.comment_index)]);
    } catch (err) {
        return error.response(err, res);
    }
}

// Modifica di un commento dato un id di un post e la posizione del commento nell'array
async function updateComment(req, res) {
    const newComment = {
        user_id: req.auth.id,
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
