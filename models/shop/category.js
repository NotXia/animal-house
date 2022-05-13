const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    target_species_id: [{
        type: ObjectId, ref: "species"
    }]
});

module.exports = mongoose.model("categories", categorySchema);
