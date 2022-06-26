const mongoose = require("mongoose");

const topicSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    icon: {
        type: String, // Base64
    }
});

module.exports = mongoose.model("topics", topicSchema);
