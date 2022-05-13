const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const commentSchema = mongoose.Schema({
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
});

module.exports = mongoose.model("comments", commentSchema);
