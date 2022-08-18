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
    return await this.findOne({ name: topic_name }).exec();
};

topicSchema.methods.getData = function() {
    return {
        name: this.name,
        icon: this.icon  
    };
};

module.exports = mongoose.model("topics", topicSchema);
