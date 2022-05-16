const mongoose = require("mongoose");
const timeSlotSchema = require("../utils/timeSlotSchema");
const getAgendaSchema = require("../utils/agenda");
const addressSchema = require("../utils/address");

const hubSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    address: { 
        type: addressSchema, 
        required: true 
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