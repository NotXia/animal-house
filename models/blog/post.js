const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;
const AnimalModel = require("../animals/animal");

const postSchema = mongoose.Schema({
    author: {
        type: String,
        required: true
    },
    content: {
        type: String, required: true
    },
    comments: [{
        author: {
            type: String,
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
    topic: { 
        type: String,
        required: true
    },
    tag_users: [{
        type: String
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
