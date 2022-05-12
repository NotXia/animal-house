const mongoose = require("mongoose");
const timeSlotSchema = require("./timeSlotSchema");

const agendaSchema = mongoose.Schema({
    monday: [timeSlotSchema],
    tuesday: [timeSlotSchema],
    wednesday: [timeSlotSchema],
    thursday: [timeSlotSchema],
    friday: [timeSlotSchema],
    saturday: [timeSlotSchema],
    sunday: [timeSlotSchema]
}, { _id: false });

module.exports = agendaSchema;