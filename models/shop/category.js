const mongoose = require("mongoose");

const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    icon: {
        type: String, // Base64
    }
});

categorySchema.statics.findByName = async function(category_name) {
    return await this.findOne({ name: category_name }).exec();
};

categorySchema.methods.getData = function() {
    return {
        name: this.name,
        icon: this.icon  
    };
};

module.exports = mongoose.model("categories", categorySchema);
