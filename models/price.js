const mongoose = require("mongoose");

const priceSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    price: Number
});

module.exports = mongoose.model("prices", priceSchema);
