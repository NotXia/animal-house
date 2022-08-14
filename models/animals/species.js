const mongoose = require("mongoose");

const speciesSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    }
});

speciesSchema.statics.findByName = async function(species_name) {
    return await this.findOne({ name: species_name }).exec();
};

speciesSchema.methods.getData = function() {
    return { name: this.name };
};

module.exports = mongoose.model("species", speciesSchema);
