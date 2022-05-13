const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
    name: { type: String },
    description: { type: String },
    images_path: [{ type: String }],

    price: { // In formato intero
        type: Number, 
        required: true, 
        validate: (val) => { return val >= 0; } 
    },
    quantity: {
        type: Number,
        required: true,
        default: 0,
        validate: (val) => { return val >= 0; } 
    }
});

module.exports = mongoose.model("products", productSchema);
