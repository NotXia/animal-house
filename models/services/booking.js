const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const bookingScheme = mongoose.Schema({
    time_slot: { start: Date, end: Date },
    service_id: { type: ObjectId, ref: "services", required: true },

    customer_id: { type: ObjectId, ref: "users", required: true },
    operator_id: { type: ObjectId, ref: "operators", required: true },
    service_hub_id: { type: ObjectId, ref: "hubs", required: true }
});

module.exports = mongoose.model("booking", bookingScheme);
