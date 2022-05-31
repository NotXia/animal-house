require('dotenv').config();
const PostModel = require("../models/blog/post.js");

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

async function searchPostByUser(req, res) {
    try {
        const posts = await PostModel.find({user_id : req.params.user_id}).exec()
        if (posts.length === 0) { res.sendStatus(404); }
        res.status(200).send(posts);
    } catch (err) {
        res.sendStatus(500);
    }

}

async function searchPostById(req, res) {
    try {
        const post = await PostModel.findById(req.params.post_id, { _id: 1 } ).exec();
        if (!post) { res.sendStatus(404); }
        res.status(200).send(post);
    } catch (err) {
        res.sendStatus(500);
    }
}

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

// function searchUser(is_operator) {
//     return async function(req, res) {
//         const RoleModel = is_operator ? OperatorModel : UserModel;

//         try {
//             const user = await RoleModel.find({ username : req.params.username }).exec();
//             res.send(user);
//         }
//         catch (e) {
//             res.sendStatus(500);
//         }
//     };
// }

// function updateUser(is_operator) {
//     return async function(req, res) {
//         const RoleModel = is_operator ? OperatorModel : UserModel;

//         const filter = { username : req.params.username };

//         try {
//             const user = await RoleModel.findOneAndUpdate(filter, req.body);
//             console.log(user);
//         } catch (e) {
//             res.sendStatus(500);
//         }
//         res.sendStatus(200);
//     }
// }


// function deleteUser(is_operator) {
//     return async function(req, res) {
//         const RoleModel = is_operator ? OperatorModel : UserModel;
        
//         try {
//             const user = await RoleModel.deleteOne({ username : req.params.username }).exec();
//             console.log(user);
//         } catch (e) {
//             res.sendStatus(500);
//         }

//         res.sendStatus(200);
//     }
// }

module.exports = {
    insertPost : insertPost,
    searchPostByUser : searchPostByUser,
    searchPostById : searchPostById,
    searchPostByCategory : searchPostByCategory,
    // searchUser: searchUser,
    // updateUser: updateUser,
    // deleteUser: deleteUser
}