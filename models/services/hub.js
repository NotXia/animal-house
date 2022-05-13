const mongoose = require("mongoose");
const timeSlotSchema = require("../utils/timeSlotSchema");
const getAgendaSchema = require("../utils/agenda");

const hubSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    address: { 
        city: String,
        street: String,
        house_number: String
    },
    opening_time: {
        type: getAgendaSchema(timeSlotSchema),
        required: true
    },

    phone: { type: String },
    email: {
        type: String, 
        match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    }
});

module.exports = mongoose.model("hubs", hubSchema);