const mongoose = require("mongoose");

const speciesSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },

    logo: { type: String }
});

speciesSchema.statics.findByName = async function(species_name) {
    return await this.findOne({ name: species_name }).exec();
};

speciesSchema.methods.getData = function() {
    return { 
        name: this.name,
        logo: this.logo
    };
};

module.exports = mongoose.model("species", speciesSchema);
