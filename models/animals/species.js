const mongoose = require("mongoose");

const speciesSchema = mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    race: { type: String }
});

module.exports = mongoose.model("species", speciesSchema);
