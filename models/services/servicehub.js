const mongoose = require("mongoose");
const agendaSchema = require("../utils/agenda");

const serviceHubSchema = mongoose.Schema({
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
        type: agendaSchema,
        required: true
    }
});

module.exports = mongoose.model("hubs", serviceHubSchema);