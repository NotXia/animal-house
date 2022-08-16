const validator = require("express-validator");
const utils = require("./utils");
const BookingModel = require("../../models/services/booking");
const error = require("../../error_handler");

module.exports.validateAppointmentId =          (source, required=true, field_name="appointment_id") => { return utils.handleRequired(validator[source](field_name), required).isMongoId().withMessage("Formato non valido"); }
module.exports.validateTimeSlot =      function (source, required=true, field_name="time_slot") {
    return [ 
        utils.handleRequired(validator[source](`${field_name}.start`), required).isISO8601().withMessage("Formato non valido").toDate(),
        utils.handleRequired(validator[source](`${field_name}.end`), required).isISO8601().withMessage("Formato non valido").toDate()
            .custom((end_time, { req }) => end_time > req[source][field_name].start).withMessage("Intervallo di tempo invalido")
    ];
};

module.exports.verifyAppointmentOwnership = async function (appointment_id, username) {
    const apppointment = await BookingModel.findById(appointment_id).exec();
    if (!apppointment) { return error.generate.NOT_FOUND("Appuntamento inesistente"); }

    if (apppointment.customer !== username && apppointment.operator !== username) { return error.generate.FORBIDDEN("Non è un tuo appuntamento"); }
}