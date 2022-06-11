const mongoose = require("mongoose");
const addressSchema = require("../utils/address");
const ObjectId = mongoose.Schema.Types.ObjectId;
const ValidationError = mongoose.Error.ValidationError
const ProductModel = require("./product");
const CustomerModel = require("../auth/customer");

const orderSchema = mongoose.Schema({
    customer_id: {
        type: ObjectId, ref: CustomerModel.collection.collectionName,
        required: true
    },
    products_id: [{
        type: ObjectId, ref: ProductModel.collection.collectionName,
    }],
    total: { 
        type: Number, 
        required: true,
        validate: (val) => { return val >= 0; }
    },
    address: { type: addressSchema, required: true },
    creationDate: {
        type: Date,
        required: true,
        default: new Date()
    }
});

orderSchema.pre("validate", function (next) {
    if (this.products_id.length <= 0) {
        next(new ValidationError());
    } else {
        next();
    }
});

module.exports = mongoose.model("orders", orderSchema);
