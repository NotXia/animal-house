const mongoose = require("mongoose");

const timeSlotSchema = mongoose.Schema({ 
    start: { type: Date, required: true }, 
    end: { type: Date, required: true } 
}, { _id: false });

timeSlotSchema.pre("validate", function (next) {
    if (this.start >= this.end) {
        next(new Error('End time must be greater than start time'));
    } else { 
        next(); 
    }
});

module.exports = timeSlotSchema;