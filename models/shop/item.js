/* 
    Il prezzo di un item è rappresentato dal suo primo product
*/

const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;
const ValidationError = mongoose.Error.ValidationError


const productSchema = mongoose.Schema({
    barcode: {
        type: String,
        required: true,
        unique: true
    },
    name: { type: String },
    description: { type: String },
    images_path: [{ type: String }],

    target_species_id: [{
        type: ObjectId, ref: "species"
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
}, {_id: false});

const itemSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    products: [ productSchema ],

    category_id: {
        type: ObjectId, ref: "categories",
        requied: true
    },
    relevance: {
        type: Number, required: true,
        default: 0
    }
});

itemSchema.index({ relevance: 1, category_id: 1, "products.barcode": 1, "products.price": 1 });

itemSchema.pre("validate", function (next) {
    if (this.products.length <= 0) {
        next(new ValidationError());
    } else {
        next();
    }
});

module.exports = mongoose.model("items", itemSchema);
