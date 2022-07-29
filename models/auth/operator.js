const mongoose = require("mongoose");
const timeSlotSchema = require("../utils/timeSlotSchema");
const getAgendaSchema = require("../utils/agenda");
const ObjectId = mongoose.Schema.Types.ObjectId;
const HubModel = require("../services/hub");
const moment = require("moment");

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

operatorScheme.methods.getAbsenceTime = function() {
    return this.absence_time.map((absence) => (
        {
            start: moment(absence.start).utcOffset('+0200').format(),
            end: moment(absence.end).utcOffset('+0200').format()
        }
    ));
};

module.exports = mongoose.model("operators", operatorScheme);