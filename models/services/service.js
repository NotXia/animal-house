const mongoose = require("mongoose");
const DiscountModel = require("../discount");

const serviceScheme = mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true 
    },
    description: { 
        type: String, 
        required: true, 
        default: "" 
    },
    duration: { // In minuti
        type: Number, 
        required: true, 
        default: 0 
    },
    price: {    // In centesimi
        type: Number,
        required: true,
        default: 0
    },
    online: {
        type: Boolean,
        required: true,
        default: false
    },
    target: [{
        type: String
    }]
});

serviceScheme.methods.getData = async function(is_vip=false) {
    return {
        id: this._id,
        name: this.name,
        description: this.description,
        duration: this.duration,
        original_price: this.price,
        price: Math.round(this.price * (1 - await DiscountModel.getVIPDiscount(is_vip))),
        online: this.online,
        target: this.target
    };
};

module.exports = mongoose.model("services", serviceScheme);
