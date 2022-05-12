const mongoose = require("mongoose");

const serviceHubSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    address: { 
        city: String,
        street: String,
        house_number: String
    },
    opening_time: {
        monday: { slot: [{ start: Date, end: Date }] },
        tuesday: { slot: [{ start: Date, end: Date }] },
        wednesday: { slot: [{ start: Date, end: Date }] },
        thursday: { slot: [{ start: Date, end: Date }] },
        friday: { slot: [{ start: Date, end: Date }] },
        saturday: { slot: [{ start: Date, end: Date }] },
        sunday: { slot: [{ start: Date, end: Date }] }
    }
});

module.exports = mongoose.model("hubs", serviceHubSchema);