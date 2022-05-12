const mongoose = require("mongoose");

const roleScheme = mongoose.Schema({
    name: { type: String, required: true, unique: true },
    services: { type: [String], require: true }
});

module.exports = mongoose.model("roles", roleScheme);
