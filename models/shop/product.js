require('dotenv').config();
const mongoose = require("mongoose");
const path = require("path");

const productSchema = mongoose.Schema({
    barcode: {
        type: String,
        required: true,
        unique: true
    },
    name: { type: String },
    description: { type: String, default: "" },
    images: [{
        path: { type: String, required: true },
        description: { type: String },
    }],

    target_species: [{
        type: String
    }],

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

productSchema.index({ price: 1, barcode: 1 });

productSchema.methods.getData = function() {
    return {
        barcode: this.barcode,
        name: this.name,
        description: this.description,
        images: this.images.map( (image) => ({
            path: path.join(process.env.SHOP_IMAGES_BASE_URL, image.path),
            description: image.description
        }) ),
        target_species: this.target_species,
        price: this.price,
        quantity: this.quantity
    };
};

module.exports = mongoose.model("products", productSchema);
