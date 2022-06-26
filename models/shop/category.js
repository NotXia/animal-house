const mongoose = require("mongoose");

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

module.exports = mongoose.model("categories", categorySchema);
