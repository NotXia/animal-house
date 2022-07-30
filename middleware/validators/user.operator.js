const validator = require("express-validator");
const utils = require("./utils");
const service_validator = require("./service");
const { WEEKS } = require("../../utilities");

module.exports.validateRole = (source, required=true, field_name="role") => { return utils.handleRequired(validator[source](field_name), required).notEmpty().withMessage("Valore mancante").trim().escape(); }

module.exports.validateListOfServices = function (source, required=true, field_name="services") {
    return [
        utils.handleRequired(validator[source](field_name), required),
        service_validator.validateServiceName(source, utils.OPTIONAL, `${field_name}.*`)
    ];
}

module.exports.validateWorkingTime = function (source, required=true, field_name="working_time") {
    if (required) {
        let out = [ utils.handleRequired(validator[source](field_name), required) ];
        for (const week of WEEKS) {
            out.push(validator[source](`${field_name}.${week}`).exists().withMessage(`Valore di ${week} mancante`));
            out.push(validator[source](`${field_name}.${week}.*.time.start`).isISO8601().withMessage("Formato non valido").toDate());
            out.push(validator[source](`${field_name}.${week}.*.time.end`).isISO8601().withMessage("Formato non valido").toDate());
            out.push(validator[source](`${field_name}.${week}.*.hub_id`).isMongoId().withMessage("Formato non valido"));
        }

        return out;
    }
    else {
        return utils.handleRequired(validator[source](field_name), utils.OPTIONAL);
    }
};

module.exports.validateAbsenceTime = function (source, required=true, field_name="absence_time") {
    return [ 
        utils.handleRequired(validator[source](`${field_name}.start`), required).isISO8601().withMessage("Formato non valido").toDate(),
        utils.handleRequired(validator[source](`${field_name}.end`), required).isISO8601().withMessage("Formato non valido").toDate()
            .custom((end_time, { req }) => end_time > req[source][field_name].start).withMessage("Intervallo di tempo invalido")
    ];
};

module.exports.validateAbsenceTimeIndex = (source, required=true, field_name="absence_time_index") => { return utils.handleRequired(validator[source](field_name), required).isInt({ min: 0 }).withMessage("Formato non valido"); }
