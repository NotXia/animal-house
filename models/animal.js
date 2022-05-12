const mongoose = require("mongoose");
const SpeciesModel = require("species");

const animalScheme = mongoose.Schema ({
    species: { 
        type: SpeciesModel.schema, 
        required: true
    },
    name: { 
        type: String, 
        required: true
    },
    weight: { type: Number },
    height: { type: Number },
    image_path: { type: String }
});

module.exports = mongoose.model("animals", animalScheme);
