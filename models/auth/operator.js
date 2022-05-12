const mongoose = require("mongoose");
const agendaSchema = require("../utils/agenda");
const ObjectId = mongoose.Schema.Types.ObjectId;

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
        required: true 
    },
    working_time: {
        type: agendaSchema,
        required: true
    },
    absence_time: {
        type: agendaSchema
    }

});

module.exports = mongoose.model("operators", operatorScheme);