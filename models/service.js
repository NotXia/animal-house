const mongoose = require("mongoose");

const serviceScheme = mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true, default: "" },
    duration: { type: Number, required: true, default: 0 } // In ms
});

module.exports = mongoose.model("services", serviceScheme);
