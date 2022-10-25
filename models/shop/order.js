const mongoose = require("mongoose");
const addressSchema = require("../utils/address");
const ValidationError = mongoose.Error.ValidationError

const STATUSES = ["pending", "created", "processed", "ready", "delivered", "cancelled"]

const orderSchema = mongoose.Schema({
    customer: { type: String, required: true },
    products: [ mongoose.Schema({
        barcode: { type: String },
        name: { type: String },
        item_name: { type: String },
        price: { type: Number },
        quantity: { type: Number },
        images: [{
            path: { type: String, required: true },
            description: { type: String },
        }]
    }, { _id: false }) ],
    total: { 
        type: Number, required: true,
        validate: (val) => { return val >= 0; }
    },
    
    pickup: { type: Boolean, default: false }, // true per ritiro in sede, false per consegna
    hub_code: { type: String },
    address: { type: addressSchema }, tracking: { type: String },
    status: { type: String, default: "pending", enum: STATUSES },

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
        tracking: this.tracking,
        status: this.status,
        creationDate: this.creationDate 
    };
};

module.exports = mongoose.model("orders", orderSchema);
module.exports.STATUSES = STATUSES;
