require('dotenv').config();
const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;
const AnimalModel = require("../animals/animal");
const path = require('path');

const postSchema = mongoose.Schema({
    author: {
        type: String,
        required: true
    },
    title: {
        type: String, required: true
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
            default: () => new Date()
        },
        updateDate: {
            type: Date,
            default: () => new Date()
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

    images: [{
        path: { type: String },
        description: { type: String }
    }],

    creationDate: {
        type: Date,
        required: true,
        default: () => new Date()
    }
});

postSchema.methods.getData = function() {
    return {
        id: this._id,
        author: this.author,
        title: this.title,
        content: this.content,
        topic: this.topic,
        tag_users: this.tag_users,
        tag_animals_id: this.tag_animals_id,
        images: this.images.map( (image) => ({
            path: path.join(process.env.BLOG_IMAGES_BASE_URL, image.path),
            description: image.description
        }) ),
        creationDate: this.creationDate
    };
};

postSchema.methods.getCommentByIndexData = function(index, real_index=null) {
    if (real_index === null) { real_index = index; }

    return {
        index: real_index,
        author: this.comments[index].author,
        content: this.comments[index].content,
        creationDate: this.comments[index].creationDate,
        updateDate: this.comments[index].updateDate
    };
};

module.exports = mongoose.model("posts", postSchema);
