const mongoose = require("mongoose");

const bookingScheme = mongoose.Schema({
    time_slot: { start: Date, end: Date },
    service: { type: String, required: true },

    customer: { type: String, required: true },
    operator: { type: String, required: true },
    service_hub: { type: String, required: true }
});

module.exports = mongoose.model("booking", bookingScheme);
