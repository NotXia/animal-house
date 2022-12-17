require('dotenv').config();
const mongoose = require("mongoose");
const path = require("path");

const animalScheme = mongoose.Schema ({
    species: { 
        type: String,
        required: true
    },
    name: { 
        type: String, 
        required: true
    },
    weight: { type: Number }, // In grammi
    height: { type: Number }, // In cm
    image_path: { type: String }
});

animalScheme.methods.getData = function() {
    return {
        id: this._id,
        species: this.species,
        name: this.name,
        weight: this.weight,
        height: this.height,
        image_path: this.image_path ? path.join(process.env.CUSTOMER_ANIMAL_IMAGES_BASE_URL, this.image_path) : process.env.PROFILE_ANIMAL_IMAGES_DEFAULT_URL
    };
};

module.exports = mongoose.model("animals", animalScheme);
