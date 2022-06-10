const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;
const addressSchema = require("../utils/address");
const AnimalModel = require("../animals/animal");
const ProductModel = require("../shop/product");

const customerScheme = mongoose.Schema({
    address: {
        type: addressSchema
    },

    animals_id: [{ type: ObjectId, ref: AnimalModel.collection.collectionName }],

    cart: [{ type: ObjectId, ref: ProductModel.collection.collectionName }]
});

module.exports = mongoose.model("customers", customerScheme);