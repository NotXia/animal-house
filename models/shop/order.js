const mongoose = require("mongoose");
const addressSchema = require("../utils/address");
const ObjectId = mongoose.Schema.Types.ObjectId;
const ValidationError = mongoose.Error.ValidationError

const orderSchema = mongoose.Schema({
    user_id: {
        type: ObjectId, ref: "users",
        required: true
    },
    products: [{
        name: { type: String, required: true },
        price: { type: Number, required: true, validate: (val) => { return val >= 0; } }
    }],

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
