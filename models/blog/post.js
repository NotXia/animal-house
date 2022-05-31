const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const postSchema = mongoose.Schema({
    user_id: {
        type: ObjectId, ref: "users",
        required: true
    },
    content: {
        type: String, required: true
    },
    comments: [{
        user_id: {
            type: ObjectId, ref: "users",
            required: true
        },
        content: {
            type: String, required: true
        },

        creationDate: {
            type: Date,
            required: true,
            default: new Date()
        }
    }],
    category: { type: String },
    tag_users_id: [{
        type: ObjectId, ref: "users"
    }],
    tag_animals_id: [{
        type: ObjectId, ref: "animals"
    }],

    creationDate: {
        type: Date,
        required: true,
        default: new Date()
    }
});

module.exports = mongoose.model("posts", postSchema);
