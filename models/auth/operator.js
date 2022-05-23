const mongoose = require("mongoose");
const timeSlotSchema = require("../utils/timeSlotSchema");
const getAgendaSchema = require("../utils/agenda");
const permissionSchema = require("../utils/permission.operator");
const ObjectId = mongoose.Schema.Types.ObjectId;

const workingSlot = mongoose.Schema({
    time: { 
        type: timeSlotSchema, 
        required: true 
    },
    hub_id: {
        type: ObjectId, ref: "hubs",
        required: true
    }
}, { _id: false });

const operatorScheme = mongoose.Schema({
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

    role_id: { 
        type: ObjectId, ref: "roles", 
        required: true,
    },
    permission: {
        type: permissionSchema,
        default: {} // Eredita i campi default dello Schema
    },
    working_time: {
        type: getAgendaSchema(workingSlot),
        required: true,
        default: {}
    },
    absence_time: {
        type: getAgendaSchema(timeSlotSchema)
    }
});

module.exports = mongoose.model("operators", operatorScheme);