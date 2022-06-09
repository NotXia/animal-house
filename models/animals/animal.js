const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;
const SpeciesModel = require("./species");

const animalScheme = mongoose.Schema ({
    species_id: { 
        type: ObjectId, ref: SpeciesModel.collection.collectionName,
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
