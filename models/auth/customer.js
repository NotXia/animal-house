const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;
const addressSchema = require("../utils/address");
const AnimalModel = require("../animals/animal");
const ItemModel = require("../shop/item");

const customerScheme = mongoose.Schema({
    address: {
        type: addressSchema
    },

    animals_id: [{ type: ObjectId, ref: AnimalModel.collection.collectionName }],

    cart: [{ 
        barcode: { type: String },
        quantity: { type: Number },
    }]
});

customerScheme.methods.getCartData = async function() {
    return await Promise.all(
        this.cart.map(async (cart_entry) => ({
            product: (await ItemModel.getProductByBarcode(cart_entry.barcode)),
            quantity: cart_entry.quantity
        }))
    );
};

module.exports = mongoose.model("customers", customerScheme);