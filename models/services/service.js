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
    } 
});

serviceScheme.methods.getData = function() {
    return {
        id: this._id,
        name: this.name,
        description: this.description,
        duration: this.duration
    };
};

module.exports = mongoose.model("services", serviceScheme);
