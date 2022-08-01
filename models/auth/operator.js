const mongoose = require("mongoose");
const timeSlotSchema = require("../utils/timeSlotSchema");
const getAgendaSchema = require("../utils/agenda");
const Moment = require("moment");
const MomentRange = require('moment-range');
const moment = MomentRange.extendMoment(Moment);
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
        start: moment(time.start).local().format(),
        end: moment(time.end).local().format()
    };
}

operatorScheme.methods.getAbsenceTimeData = function() {
    return this.absence_time.map((absence) => formatTimeSlot(absence));
};

operatorScheme.methods.getWorkingTimeData = function() {
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

operatorScheme.methods.getAvailabilityData = function(start_date, end_date) {
    let availabilities = [];
    
    for (let query_day=moment(start_date); query_day.diff(end_date, 'days') <= 0; query_day.add(1, 'days')) {
        for (const work_time of this.working_time[WEEKS[query_day.isoWeekday()-1]]) {
            let start_time = moment(work_time.time.start).set({ date: query_day.date(), month: query_day.month(), year: query_day.year() });
            let end_time = moment(work_time.time.end).set({ date: query_day.date(), month: query_day.month(), year: query_day.year() });
            
            availabilities.push({
                time: moment.range(start_time, end_time),
                hub: work_time.hub
            });
        }
    }
        
    for (const absence of this.absence_time) { 
        let absence_interval = moment.range(absence.start, absence.end);
        let new_availabilities = [];

        for (const availability of availabilities) {
            const new_intervals = (availability.time).subtract(absence_interval);

            for (const interval of new_intervals) { new_availabilities.push({ time: interval, hub: availability.hub }); } 
        }

        availabilities = new_availabilities;
    }

    // TODO: Controllo rispetto alle prenotazioni

    availabilities = availabilities.map((availability) => ({
        time: formatTimeSlot(availability.time),
        hub: availability.hub
    }));

    return availabilities;
};

module.exports = mongoose.model("operators", operatorScheme);