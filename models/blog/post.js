const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;
const UserModel = require("../auth/user");
const AnimalModel = require("../animals/animal");

const postSchema = mongoose.Schema({
    user_id: {
        type: ObjectId, ref: UserModel.collection.collectionName,
        required: true
    },
    content: {
        type: String, required: true
    },
    comments: [{
        user_id: {
            type: ObjectId, ref: UserModel.collection.collectionName,
            required: true
        },
        content: {
            type: String, required: true
        },
        creationDate: {
            type: Date,
            required: true,
            default: new Date()
        },
        updateDate: {
            type: Date,
            default: new Date()
        }
    }],
    category: { type: String },
    tag_users_id: [{
        type: ObjectId, ref: UserModel.collection.collectionName
    }],
    tag_animals_id: [{
        type: ObjectId, ref: AnimalModel.collection.collectionName
    }],

    creationDate: {
        type: Date,
        required: true,
        default: new Date()
    }
});

module.exports = mongoose.model("posts", postSchema);
