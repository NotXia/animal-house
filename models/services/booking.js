const mongoose = require("mongoose");
const timeSlotSchema = require("../utils/timeSlotSchema");
const ObjectId = mongoose.Schema.Types.ObjectId;

const bookingScheme = mongoose.Schema({
    time_slot: { type: timeSlotSchema, required: true },
    service_id: { type: ObjectId, ref: "services", required: true },

    customer_id: { type: ObjectId, ref: "users", required: true },
    operator_id: { type: ObjectId, ref: "operators", required: true },
    hub_id:      { type: ObjectId, ref: "hubs", required: true }
});

module.exports = mongoose.model("booking", bookingScheme);
