const mongoose = require("mongoose");

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

    role: { type: String },
    working_time: {
        monday: { slot: [{ start: Date, end: Date }] },
        tuesday: { slot: [{ start: Date, end: Date }] },
        wednesday: { slot: [{ start: Date, end: Date }] },
        thursday: { slot: [{ start: Date, end: Date }] },
        friday: { slot: [{ start: Date, end: Date }] },
        saturday: { slot: [{ start: Date, end: Date }] },
        sunday: { slot: [{ start: Date, end: Date }] }
    },
    absence_time: {
        monday: { slot: [{ start: Date, end: Date }] },
        tuesday: { slot: [{ start: Date, end: Date }] },
        wednesday: { slot: [{ start: Date, end: Date }] },
        thursday: { slot: [{ start: Date, end: Date }] },
        friday: { slot: [{ start: Date, end: Date }] },
        saturday: { slot: [{ start: Date, end: Date }] },
        sunday: { slot: [{ start: Date, end: Date }] }
    }

});

module.exports = mongoose.model("operators", operatorScheme);