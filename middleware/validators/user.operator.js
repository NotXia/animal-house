const validator = require("express-validator");
const utils = require("./utils");
const service_validator = require("./service");
const hub_validator = require("./hub");
const error = require("../../error_handler");
const { WEEKS } = require("../../utilities");
const moment = require("moment");

module.exports.validateRole = (source, required=true, field_name="role") => { return utils.handleRequired(validator[source](field_name), required).notEmpty().withMessage("Valore mancante").trim().escape(); }

module.exports.validateListOfServices = function (source, required=true, field_name="services") {
    return [
        utils.handleRequired(validator[source](field_name), required),
        service_validator.validateServiceName(source, utils.OPTIONAL, `${field_name}.*`)
    ];
}

module.exports.validateWorkingTime = function (source, required=true, field_name="working_time") {
    let out = [ utils.handleRequired(validator[source](field_name), required) ];

    if (required) {
        for (const week of WEEKS) {
            out.push(validator[source](`${field_name}.${week}`).exists().withMessage(`Valore di ${week} mancante`));
            out.push(validator[source](`${field_name}.${week}.*.time.start`).exists().isISO8601().withMessage("Formato non valido").toDate());
            out.push(validator[source](`${field_name}.${week}.*.time.end`).exists().isISO8601().withMessage("Formato non valido").toDate());
            hub_validator.validateCode(source, required=true, `${field_name}.${week}.*.hub`);
        }
    }

    out.push(
        // Verifica validità intervalli temporali
        function (req, res, next) {
            for (const week of WEEKS) {
                for (const work_time of req[source][field_name][week]) {
                    if (moment(work_time.time.start) >= moment(work_time.time.end)) { 
                        next( error.generate.BAD_REQUEST([{ field: field_name, message: "Intervallo di tempo invalido" }]) );
                    }
                }
            }
            
            next();
        }
    )

    return out;
};

module.exports.validateAbsenceTime = function (source, required=true, field_name="absence_time") {
    return [ 
        utils.handleRequired(validator[source](`${field_name}.start`), required).isISO8601().withMessage("Formato non valido").toDate(),
        utils.handleRequired(validator[source](`${field_name}.end`), required).isISO8601().withMessage("Formato non valido").toDate()
            .custom((end_time, { req }) => end_time > req[source][field_name].start).withMessage("Intervallo di tempo invalido")
    ];
};

module.exports.validateAbsenceTimeIndex = (source, required=true, field_name="absence_time_index") => { return utils.handleRequired(validator[source](field_name), required).isInt({ min: 0 }).withMessage("Formato non valido"); }
