const mongoose = require("mongoose");
const ValidationError = mongoose.Error.ValidationError

const timeSlotSchema = mongoose.Schema({ 
    start: { type: Date, required: true }, 
    end: { type: Date, required: true } 
}, { _id: false });

timeSlotSchema.pre("validate", function (next) {
    if (this.start >= this.end) {
        next(new ValidationError());
    } else { 
        next(); 
    }
});

module.exports = timeSlotSchema;