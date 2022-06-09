const mongoose = require("mongoose");
const timeSlotSchema = require("../utils/timeSlotSchema");
const ObjectId = mongoose.Schema.Types.ObjectId;
const ServiceModel = require("./service");
const HubModel = require("./hub");
const CustomerModel = require("../auth/customer");
const OperatorModel = require("../auth/operator");

const bookingScheme = mongoose.Schema({
    time_slot: { type: timeSlotSchema, required: true },
    service_id: { type: ObjectId, ref: ServiceModel.collection.collectionName, required: true },

    customer_id: { type: ObjectId, ref: CustomerModel.collection.collectionName, required: true },
    operator_id: { type: ObjectId, ref: OperatorModel.collection.collectionName, required: true },
    hub_id: { type: ObjectId, ref: HubModel.collection.collectionName, required: true }
});

module.exports = mongoose.model("booking", bookingScheme);
