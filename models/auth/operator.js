const mongoose = require("mongoose");
const timeSlotSchema = require("../utils/timeSlotSchema");
const getAgendaSchema = require("../utils/agenda");
const ObjectId = mongoose.Schema.Types.ObjectId;
const HubModel = require("../services/hub");
const RoleModel = require("../services/role");

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
    role_id: { 
        type: ObjectId, ref: RoleModel.collection.collectionName, 
        required: true,
    },

    working_time: {
        type: getAgendaSchema(workingSlot),
        required: true,
        default: {}
    },
    absence_time: {
        type: getAgendaSchema(timeSlotSchema)
    }
});

module.exports = mongoose.model("operators", operatorScheme);