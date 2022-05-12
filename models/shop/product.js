const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },

    images_path: [{ type: String }]
});

module.exports = mongoose.model("products", productSchema);
