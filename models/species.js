const mongoose = require("mongoose");

const speciesSchema = mongoose.Schema({
    type: {
        type: String,
        required: true,
        unique: true
    },
    race: { type: String } // TODO Rivedere gestione
});

module.exports = mongoose.model("species", speciesSchema);