const mongoose = require("mongoose");
const timeSlotSchema = require("../utils/timeSlotSchema");
const getAgendaSchema = require("../utils/agenda");
const addressSchema = require("../utils/address");

const hubSchema = mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
        // TODO: add regex (3 chars+number)
    },
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

hubSchema.methods.getData = function() {
    return {
        code: this.code,
        name: this.name,
        address: this.address,
        opening_time: this.opening_time, // TODO
        phone: this.phone,
        email: this.email
    };
};

module.exports = mongoose.model("hubs", hubSchema);