const mongoose = require("mongoose");

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

serviceScheme.methods.getData = function() {
    return {
        id: this._id,
        name: this.name,
        description: this.description,
        duration: this.duration,
        price: this.price,
        target: this.target
    };
};

module.exports = mongoose.model("services", serviceScheme);
