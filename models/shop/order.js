const mongoose = require("mongoose");
const addressSchema = require("../utils/address");
const ValidationError = mongoose.Error.ValidationError

const orderSchema = mongoose.Schema({
    customer: { type: String, required: true },
    products: [ mongoose.Schema({
        barcode: { type: String },
        name: { type: String },
        price: { type: Number }
    }, { _id: false }) ],
    total: { 
        type: Number, required: true,
        validate: (val) => { return val >= 0; }
    },
    
    pickup: { type: Boolean, default: false }, // true per ritiro in sede, false per consegna
    hub_code: { type: String },
    address: { type: addressSchema }, tracking: { type: String },
    status: { type: String, default: "created", enum: ["created", "processed", "ready", "delivered", "cancelled"] },

    creationDate: {
        type: Date,
        required: true,
        default: new Date()
    }
});

orderSchema.pre("validate", function (next) {
    if (this.products.length <= 0 ||
        (this.pickup && !this.hub_code) || (!this.pickup && !this.address)) {
        next(new ValidationError());
    } else {
        next();
    }
});

orderSchema.methods.getData = function() {
    return {
        id: this._id,
        customer: this.customer,
        products: this.products,
        total: this.total,
        pickup: this.pickup,
        hub_code: this.hub_code,
        address: this.address,
        status: this.status,
        creationDate: this.creationDate 
    };
};

module.exports = mongoose.model("orders", orderSchema);
