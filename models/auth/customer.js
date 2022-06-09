const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;
const addressSchema = require("../utils/address");
const permissionSchema = require("../utils/permission.user");
const AnimalModel = require("../animals/animal");
const ProductModel = require("../shop/product");

const customerScheme = mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true,
        unique: true,
        match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    },

    name: { type: String, required: true }, 
    surname: { type: String, required: true },
    gender: { type: String },

    address: [{ // [0] contiene l'indirizzo principale
        type: addressSchema,
    }],
    phone: { type: String },

    enabled: { 
        type: Boolean, 
        required: true, 
        default: false 
    },
    creationDate: { 
        type: Date, 
        required: true, 
        default: new Date() 
    },

    permission: { type: permissionSchema, default: {} }, // Eredita i campi default dello Schema
    animals_id: [{ type: ObjectId, ref: AnimalModel.collection.collectionName }],

    cart: [{ type: ObjectId, ref: ProductModel.collection.collectionName }]
});

module.exports = mongoose.model("customers", customerScheme);