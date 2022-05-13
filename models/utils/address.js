const mongoose = require("mongoose");

const addressSchema = mongoose.Schema({
    city: { type: String, required: true },
    street: { type: String, required: true },
    number: { type: String, required: true },
    postal_code: { type: String, required: true }
}, { _id: false });

module.exports = addressSchema;