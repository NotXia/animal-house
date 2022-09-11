const mongoose = require("mongoose");
const timeSlotSchema = require("../utils/timeSlotSchema");
const getAgendaSchema = require("../utils/agenda");
const addressSchema = require("../utils/address");
const moment = require("moment");
const { WEEKS } = require("../../utilities");

const hubSchema = mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        match: /^[A-Z]{3}[1-9][0-9]*$/
    },
    name: {
        type: String,
        required: true,
    },
    address: { 
        type: addressSchema, 
        required: true 
    },
    position: { // Formato GeoJSON
        type: {
            type: String, enum: ["Point"],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
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

hubSchema.index({ position: "2dsphere", code: 1 });

hubSchema.methods.convertTime = function() {
    let convertedOpeningTime = {};
    for(const day of WEEKS) {
        convertedOpeningTime[day] = [];
        for(const time of this.opening_time[day]) {
            let convertedStart = moment(time.start).local().format();
            let convertedEnd = moment(time.end).local().format();
            convertedOpeningTime[day].push({ start : convertedStart , end : convertedEnd });
        }
    }
    return convertedOpeningTime;
};

hubSchema.methods.getData = function() {
    return {
        code: this.code,
        name: this.name,
        address: this.address,
        position: this.position,
        opening_time: this.convertTime(),
        phone: this.phone,
        email: this.email
    };
};

module.exports = mongoose.model("hubs", hubSchema);