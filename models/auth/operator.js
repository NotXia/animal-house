const mongoose = require("mongoose");
const timeSlotSchema = require("../utils/timeSlotSchema");
const getAgendaSchema = require("../utils/agenda");
const ObjectId = mongoose.Schema.Types.ObjectId;
const HubModel = require("../services/hub");
const moment = require("moment");
const { WEEKS } = require("../../utilities");

const workingSlot = mongoose.Schema({
    time: { 
        type: timeSlotSchema, 
        required: true 
    },
    hub_id: {
        type: ObjectId, ref: HubModel.collection.collectionName,
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
    const data = await this.populate("working_time.monday.hub_id");

    for (let week of WEEKS) {
        out[week] = data.working_time[week].map(function (work_time) {
            return {
                time: formatTimeSlot(work_time.time),
                hub_id: work_time.hub_id === null ? null : work_time.hub_id._id.toString()
            };
        });
    }

    return out;
};

module.exports = mongoose.model("operators", operatorScheme);