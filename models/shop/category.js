const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    }
});

module.exports = mongoose.model("categories", categorySchema);
