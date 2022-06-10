const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;
const CustomerModel = require("./customer");
const OperatorModel = require("./operator");

const permissionSchema = mongoose.Schema({
    operator: { type: Boolean, default: false },
    admin: { type: Boolean, default: false },
    customer: { type: Boolean, default: false },

    shop_read: { type: Boolean, default: false },
    shop_write: { type: Boolean, default: false },

    post_write: { type: Boolean, default: false },
    comment_write: { type: Boolean, default: false },

    vip: { type: Boolean, default: false },
}, { _id: false });

const userScheme = mongoose.Schema({
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

    permission: { type: permissionSchema, default: {}, required: true },
    type_id: { type: ObjectId, required: true }
}, {toJSON: { virtuals: true }, toObject: { virtuals: true } });

userScheme.virtual("customer", {
    ref: CustomerModel.collection.collectionName,
    localField: 'type_id',
    foreignField: '_id',
    justOne: true
});

userScheme.virtual("operator", {
    ref: OperatorModel.collection.collectionName,
    localField: 'type_id',
    foreignField: '_id',
    justOne: true
});

module.exports = mongoose.model("users", userScheme);