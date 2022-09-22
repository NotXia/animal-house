/* 
    Il prezzo di un item è rappresentato dal suo primo product
*/

const mongoose = require("mongoose");
const ValidationError = mongoose.Error.ValidationError
const path = require("path");

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

    products: [ mongoose.Schema({
        barcode: { type: String, required: true, unique: true },
        name: { type: String },
        description: { type: String, default: "" },
        images: [{
            path: { type: String, required: true },
            description: { type: String },
        }],
        target_species: [{ type: String }],
        price: { // In formato intero
            type: Number, required: true, 
            validate: (val) => { return val >= 0; } 
        },
        quantity: {
            type: Number, required: true, default: 0,
            validate: (val) => { return val >= 0; } 
        }
    }, { _id: false }) ],

    relevance: {
        type: Number, required: true,
        default: 0
    }
});

itemSchema.index({ relevance: 1, category: 1, "products.barcode": 1 });

itemSchema.pre("validate", function (next) {
    if (this.products.length <= 0) {
        next(new ValidationError());
    }
    else {
        next();
    }
});

function productGetData(product) {
    return {
        barcode: product.barcode,
        name: product.name,
        description: product.description,
        images: product.images.map( (image) => ({
            path: path.join(process.env.SHOP_IMAGES_BASE_URL, image.path),
            description: image.description
        }) ),
        target_species: product.target_species,
        price: product.price,
        quantity: product.quantity
    }
}

itemSchema.methods.getData = function() {
    return {
        id: this._id,
        name: this.name,
        description: this.description,
        category: this.category,
        relevance: this.relevance,
        products: this.products.map(product => productGetData(product))
    };
};

itemSchema.statics.getProductByBarcode = async function(barcode) {
    // Ricerca item che contiene barcode
    const item = await this.findOne({ "products.barcode": barcode }).exec();
    if (!item) { return null; }

    // Estrazione prodotto
    return productGetData(item.products.find((product) => product.barcode === barcode));
};

itemSchema.statics.updateProductAmount = async function(barcode, factor) {
    // Ricerca item che contiene barcode
    const item = await this.findOne({ "products.barcode": barcode }).exec();
    if (!item) { return; }

    // Estrazione prodotto
    for (let i=0; i<item.products.length; i++) {
        if (item.products[i].barcode === barcode) {
            item.products[i].quantity += factor;
            break;
        }
    }

    await item.save();
};

module.exports = mongoose.model("items", itemSchema);
