const mongoose = require("mongoose");

const speciesSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("species", speciesSchema);
