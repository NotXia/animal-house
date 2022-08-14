const mongoose = require("mongoose");

const speciesSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});

speciesSchema.statics.findByName = async function(species_name) {
    return await this.findOne({ name: species_name }).exec();
};

module.exports = mongoose.model("species", speciesSchema);
