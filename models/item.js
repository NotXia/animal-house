const mongoose = require("mongoose");
const CategoryModel = require("category");
const ProductModel = require("products");

const itemSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    catergory: {
        type: CategoryModel.scheme,
        requied: true
    },
    products: { 
        type: [ProductModel.scheme],
        required: true
    },
});

module.exports = mongoose.model("items", itemSchema);
