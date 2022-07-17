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

topicSchema.statics.findByName = async function(topic_name) {
    return await this.findOne({ name: topic_name }).exec();
};

module.exports = mongoose.model("topics", topicSchema);
