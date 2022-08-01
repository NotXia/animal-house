const mongoose = require("mongoose");
const timeSlotSchema = require("../utils/timeSlotSchema");
const getAgendaSchema = require("../utils/agenda");
const moment = require("moment");
const { WEEKS } = require("../../utilities");

const workingSlot = mongoose.Schema({
    time: { 
        type: timeSlotSchema, 
        required: true 
    },
    hub: {
        type: String,
        match: /^[A-Z]{3}[1-9][0-9]*$/,
        required: true
    }
}, { _id: false });

const operatorScheme = mongoose.Schema({
    role: { type: String, default: "" },

    services: [{ 
        type: String,  
    }],

    working_time: {
        type: getAgendaSchema(workingSlot),
        required: true,
        default: {}
    },
    absence_time: [{
        type: timeSlotSchema
    }]
});

function formatTimeSlot(time) {
    return {
        start: moment(time.start).utcOffset('+0200').format(),
        end: moment(time.end).utcOffset('+0200').format()
    };
}

operatorScheme.methods.getAbsenceTimeData = function() {
    return this.absence_time.map((absence) => formatTimeSlot(absence));
};

operatorScheme.methods.getWorkingTimeData = async function() {
    let out = {};

    for (let week of WEEKS) {
        out[week] = this.working_time[week].map(function (work_time) {
            return {
                time: formatTimeSlot(work_time.time),
                hub: work_time.hub
            };
        });
    }

    return out;
};

module.exports = mongoose.model("operators", operatorScheme);