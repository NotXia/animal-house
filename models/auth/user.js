require('dotenv').config();
const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;
const CustomerModel = require("./customer");
const OperatorModel = require("./operator");
const path = require('path');
const moment = require("moment");

const permissionSchema = mongoose.Schema({
    operator: { type: Boolean, default: false },
    admin: { type: Boolean, default: false },
    customer: { type: Boolean, default: false },

    shop_read: { type: Boolean, default: false },
    shop_write: { type: Boolean, default: false },
    warehouse: { type: Boolean, default: false },

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

    picture: {
        type: String, default: ""
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
        default: () => new Date()
    },

    permissions: [{ type: String }],
    type_id: { type: ObjectId, required: true },
    type_name: { type: String, required: true, enum: ['customer', 'operator'] }
}, { toJSON: { virtuals: true }, toObject: { virtuals: true }, collation: {locale: "en", strength: 2} });

userScheme.index({ "username": 1});

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

userScheme.methods.isOperator = function() {
    return this.type_name === "operator";
};

userScheme.methods.getAllData = async function() {
    let data = await this.populate(this.type_name);
    let out = {
        username: data.username,
        email: data.email,
        name: data.name,
        surname: data.surname,
        gender: data.gender,
        phone: data.phone,
        permissions: data.permissions,
        enabled: data.enabled,
        picture: data.picture ? path.join(process.env.PROFILE_PICTURE_IMAGES_BASE_URL, data.picture) : process.env.PROFILE_PICTURE_DEFAULT_URL
    };

    if (this.isOperator()) {
        out.role = data.operator.role;
        out.services_id = data.operator.services_id;
        out.working_time = (await this.findType()).getWorkingTimeData()
    }
    else {
        out.address = data.customer.address;
        out.vip_until = data.customer.vip_until;
    }

    return out;
};

// Dati visibili al pubblico
userScheme.methods.getPublicData = async function() {
    let data = await this.populate(this.type_name);
    let out = {
        username: data.username,
        name: data.name,
        surname: data.surname,
        picture: data.picture != "" ? path.join(process.env.PROFILE_PICTURE_IMAGES_BASE_URL, data.picture) : process.env.PROFILE_PICTURE_DEFAULT_URL
    };

    if (this.isOperator()) {
        out.email = data.email,
        out.phone = data.phone,
        out.role = data.operator.role;
        out.services_id = data.operator.services_id;
    }
    else {
        out.vip_until = data.customer.vip_until;
    }

    return out;
};

/**
 * Cerca e restituisce i dati del tipo dell'utente. I dati dell'utenza sono disponibili nel campo user
 * @returns Una instanza di Customer od Operator arricchita da user
 */
userScheme.methods.findType = async function() {
    const Model = this.isOperator() ? OperatorModel : CustomerModel;

    const data = await Model.findById(this.type_id).exec();
    data.user = this;

    return data
};

/**
 * Cerca e aggiorna i dati del tipo dell'utente
 * @returns Una instanza di Customer od Operator aggiornata
 */
userScheme.methods.updateType = async function(updated_data) {
    const Model = this.isOperator() ? OperatorModel : CustomerModel;

    return await Model.findByIdAndUpdate(this.type_id, updated_data, { new: true, runValidators: true });
};


userScheme.statics.isVIP = async function(username) {
    const user = await this.findOne({ username: username });
    const customer = await user.findType();
    
    return moment(customer.vip_until).isSameOrAfter(moment());
};

module.exports = mongoose.model("users", userScheme);