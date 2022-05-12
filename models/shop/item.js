const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const itemSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
        default: ""
    },
    catergory_id: {
        type: ObjectId, ref: "categories",
        requied: true
    },
    products_id: [{ 
        type: ObjectId, ref: "products",
        required: true
    }],
});

module.exports = mongoose.model("items", itemSchema);
