/* 
    Il prezzo di un item è rappresentato dal suo primo product
*/

const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;
const ValidationError = mongoose.Error.ValidationError

const itemSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    category_id: {
        type: ObjectId, ref: "categories",
        requied: true
    },
    products_id: [{ 
        type: ObjectId, ref: "products",
    }],
    relevance: {
        type: Number, required: true,
        default: 0
    }
});

itemSchema.pre("validate", function (next) {
    if (this.products_id.length <= 0) {
        next(new ValidationError());
    } else {
        next();
    }
});

module.exports = mongoose.model("items", itemSchema);
