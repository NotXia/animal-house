const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;
const addressSchema = require("../utils/address");
const AnimalModel = require("../animals/animal");
const ItemModel = require("../shop/item");
const moment = require("moment");

const customerScheme = mongoose.Schema({
    address: {
        type: addressSchema
    },

    animals_id: [{ type: ObjectId, ref: AnimalModel.collection.collectionName }],

    cart: [{ 
        barcode: { type: String },
        quantity: { type: Number },
    }],

    vip_until: {
        type: Date,
        default: "2023-01-01"
    },
    payment_id: String
});

customerScheme.methods.getCartData = async function() {
    const is_vip = moment(this.vip_until).isSameOrAfter(moment());

    return await Promise.all(
        this.cart.map(async (cart_entry) => ({
            source_item: await (await ItemModel.findOne({ "products.barcode": cart_entry.barcode }).exec()).getData(is_vip),
            product: (await ItemModel.getProductByBarcode(cart_entry.barcode, is_vip)),
            quantity: cart_entry.quantity
        }))
    );
};

module.exports = mongoose.model("customers", customerScheme);