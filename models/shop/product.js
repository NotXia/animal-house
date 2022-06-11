const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;
const SpeciesModel = require("../animals/species");

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
        type: ObjectId, ref: SpeciesModel.collection.collectionName
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


module.exports = mongoose.model("products", productSchema);
