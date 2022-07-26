const mongoose = require("mongoose");

const animalScheme = mongoose.Schema ({
    species: { 
        type: String,
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
