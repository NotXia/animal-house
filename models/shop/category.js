const mongoose = require("mongoose");
const error = require("../../error_handler");

const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    icon: {
        type: String, // Base64
    }
});

categorySchema.statics.findByName = async function(category_name) {
    return await this.findOne({ name: category_name }).exec();
};

module.exports = mongoose.model("categories", categorySchema);
