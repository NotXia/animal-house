const validator = require("express-validator");
const utils = require("./utils");

module.exports.validateTimeSlot = function (source, required=true, field_name="time_slot") {
    return [ 
        utils.handleRequired(validator[source](`${field_name}.start`), required).isISO8601().withMessage("Formato non valido").toDate(),
        utils.handleRequired(validator[source](`${field_name}.end`), required).isISO8601().withMessage("Formato non valido").toDate()
            .custom((end_time, { req }) => end_time > req[source][field_name].start).withMessage("Intervallo di tempo invalido")
    ];
};