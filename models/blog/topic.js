const mongoose = require("mongoose");
const error = require("../../error_handler");

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
    const topic = await this.findOne({ name: topic_name }).exec();
    if (!topic) { throw error.generate.NOT_FOUND("Topic inesistente"); }
    
    return topic;
};

module.exports = mongoose.model("topics", topicSchema);
