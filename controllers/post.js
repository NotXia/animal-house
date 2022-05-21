require('dotenv').config();
const PostModel = require("../models/blog/post.js");

async function insertPost(req, res) {
    try {
        const newPost = new PostModel({
            user_id: req.body.user_id,
            content: req.body.content,
            tag_users_id: req.body.tag_users_id,
            tag_animals_id: req.body.tag_animals_id
        });
        await newPost.save();
    } catch (e) {
        res.sendStatus(500);
    }
    res.sendStatus(200);
}

async function searchPost(req, res) {

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
    insertPost: insertPost,
    searchPost: searchPost,
    // searchUser: searchUser,
    // updateUser: updateUser,
    // deleteUser: deleteUser
}