const mongoose = require("mongoose");
const timeSlotSchema = require("../utils/timeSlotSchema");
const ObjectId = mongoose.Schema.Types.ObjectId;
const ServiceModel = require("./service");
const AnimalModel = require("../animals/animal");

const bookingScheme = mongoose.Schema({
    time_slot: { type: timeSlotSchema, required: true },
    service_id: { type: ObjectId, ref: ServiceModel.collection.collectionName, required: true },

    customer: { type: String, required: true },
    animal_id: { type: ObjectId, ref: AnimalModel.collection.collectionName, required: true },
    operator: { type: String, required: true },
    hub: { type: String, required: true }
});

bookingScheme.methods.getData = function() {
    return {
        time_slot: this.time_slot,
        service_id: this.service_id,
        customer: this.customer,
        animal_id: this.animal_id,
        operator: this.operator,
        hub: this.hub
    };
};

module.exports = mongoose.model("booking", bookingScheme);
