const validator = require("express-validator");
const utils = require("./utils");
const service_validator = require("./service");
const hub_validator = require("./hub");
const error = require("../../error_handler");
const { WEEKS } = require("../../utilities");
const Moment = require("moment");
const MomentRange = require('moment-range');
const moment = MomentRange.extendMoment(Moment);

module.exports.validateRole = (source, required=true, field_name="role") => { return utils.handleRequired(validator[source](field_name), required).notEmpty().withMessage("Valore mancante").trim().escape(); }

module.exports.validateListOfServicesId = function (source, required=true, field_name="services_id") {
    return [
        utils.handleRequired(validator[source](field_name), required),
        service_validator.validateServiceId(source, utils.OPTIONAL, `${field_name}.*`)
    ];
}

module.exports.validateWorkingTime = function (source, required=true, field_name="working_time") {
    let out = [ utils.handleRequired(validator[source](field_name), required) ];

    for (const week of WEEKS) {
        out.push(validator[source](`${field_name}.${week}`).if((_, { req }) => { return req[source][field_name]; }).exists().withMessage(`Valore di ${week} mancante`));
        out.push(validator[source](`${field_name}.${week}.*.time.start`).exists().isISO8601().withMessage("Formato non valido").toDate());
        out.push(validator[source](`${field_name}.${week}.*.time.end`).exists().isISO8601().withMessage("Formato non valido").toDate());
        out.push(hub_validator.validateCode(source, required=true, `${field_name}.${week}.*.hub`));
    }

    out.push(
        // Verifica validità intervalli temporali
        function (req, res, next) {
            if (!req[source][field_name]) { return next(); }

            for (const week of WEEKS) {
                if (!req[source][field_name][week]) { return next(); }
                
                let slots = []; // Per gli slot validati

                for (const work_time of req[source][field_name][week]) {
                    // Controllo che inizio e fine siano consistenti
                    if (moment(work_time.time.start).isSameOrAfter(moment(work_time.time.end))) { 
                        return next( error.generate.BAD_REQUEST([{ field: field_name, message: "Intervallo di tempo invalido" }]) );
                    }

                    // Salvataggio degli slot validi (per verifica sovrapposizioni)
                    slots.push( moment.range(moment(work_time.time.start), moment(work_time.time.end)) );
                }

                // Controllo sovrapposizioni
                for (let i=0; i<slots.length; i++) {
                    for (let j=i+1; j<slots.length; j++) {
                        if (slots[i].overlaps(slots[j])) { return next( error.generate.BAD_REQUEST([{ field: field_name, message: "Gli intervalli si sovrappongono" }]) ); }
                    }
                }
            }
            
            return next();
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
