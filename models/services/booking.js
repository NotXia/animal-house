const mongoose = require("mongoose");
const timeSlotSchema = require("../utils/timeSlotSchema");
const ObjectId = mongoose.Schema.Types.ObjectId;
const ServiceModel = require("./service");

const bookingScheme = mongoose.Schema({
    time_slot: { type: timeSlotSchema, required: true },
    service_id: { type: ObjectId, ref: ServiceModel.collection.collectionName, required: true },

    customer: { type: String, required: true },
    operator: { type: String, required: true },
    hub: { type: String, required: true }
});

module.exports = mongoose.model("booking", bookingScheme);
