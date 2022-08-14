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

animalScheme.methods.getData = function() {
    return {
        species: this.species,
        name: this.name,
        weight: this.weight,
        height: this.height,
        image_path: this.image_path
    };
};

module.exports = mongoose.model("animals", animalScheme);
