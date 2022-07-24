/* 
    Il prezzo di un item è rappresentato dal suo primo product
*/

const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;
const ValidationError = mongoose.Error.ValidationError
const ProductModel = require("./product");

const itemSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    category: {
        type: String,
        requied: true
    },
    products_id: [{ 
        type: ObjectId, ref: ProductModel.collection.collectionName,
    }],
    relevance: {
        type: Number, required: true,
        default: 0
    }
});

itemSchema.index({ relevance: 1, products_id: 1, category_id: 1 });

itemSchema.pre("validate", async function (next) {
    if (this.products_id.length <= 0) {
        next(new ValidationError());
    }
    else {
        next();
    }
});

itemSchema.methods.getData = async function() {
    const data = await this.populate("products_id");

    return {
        id: data._id,
        name: data.name,
        description: data.description,
        category: data.category,
        relevance: data.relevance,
        products: data.products_id.map(product => product.getData())
    };
};

module.exports = mongoose.model("items", itemSchema);
