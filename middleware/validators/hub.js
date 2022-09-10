const validator = require("express-validator");
const utils = require("./utils");
const userValidator = require("./user");
const customerValidator = require("./user.customer");
const { WEEKS } = require("../../utilities");
const moment = require("moment");
const error = require("../../error_handler");

module.exports.validateCode =       (source, required=true, field_name="code") => { return utils.handleRequired(validator[source](field_name), required).notEmpty().withMessage("Valore mancante").trim().matches(/^[A-Z]{3}[1-9][0-9]*$/).withMessage("Codice malformato"); }
module.exports.validateName =       (source, required=true, field_name="name") => { return utils.handleRequired(validator[source](field_name), required).notEmpty().withMessage("Valore mancante").trim(); }
module.exports.validateAddress =    (source, required=true, field_name="address") => { return customerValidator.validateAddress(source, required, field_name); }
module.exports.validateOpeningTime = function (source, required=true, field_name="opening_time") {
    let out = [ utils.handleRequired(validator[source](field_name), required) ];
    
    for (const week of WEEKS) {
        out.push(validator[source](`${field_name}.${week}`).if((_, { req }) => { return req[source][field_name]; }).exists().withMessage(`Valore di ${week} mancante`));
        out.push(validator[source](`${field_name}.${week}.*.start`).optional().isISO8601().withMessage("Formato non valido").toDate());
        out.push(validator[source](`${field_name}.${week}.*.end`).optional().isISO8601().withMessage("Formato non valido").toDate());
    }

    out.push(
        // Verifica validità intervalli temporali
        function (req, res, next) {
            if (!req[source][field_name]) {
                return next();
            }
            for (const week of WEEKS) {
                if (!req[source][field_name][week]) { return next(); }

                for (const opening_time of req[source][field_name][week]) {
                    if (moment(opening_time.start).isSameOrAfter(moment(opening_time.end))) { 
                        next( error.generate.BAD_REQUEST([{ field: field_name, message: "Intervallo di tempo invalido" }]) );
                    }
                }
            }

            next();
        }
    )

    return out;
}
module.exports.validatePhone =      (source, required=true, field_name="phone") => { return userValidator.validatePhone(source, required, field_name); }
module.exports.validateEmail =      (source, required=true, field_name="email") => { return userValidator.validateEmail(source, required, field_name); }
module.exports.validateCoordinates = function (source, required=true, field_name="position") { 
    return [
        utils.handleRequired(validator[source](field_name), required),
        utils.handleRequired(validator[source](`${field_name}.type`), required).if((_, { req }) => { return req[source][field_name]; }).equals("Point").withMessage("Il tipo deve essere 'Point'"),
        utils.handleRequired(validator[source](`${field_name}.coordinates`), required).if((_, { req }) => { return req[source][field_name]; }).isArray().withMessage("Formato non valido"),
        utils.handleRequired(validator[source](`${field_name}.coordinates.*`), required).if((_, { req }) => { return req[source][field_name]; }).isFloat().withMessage("Formato non valido")
    ]; 
}
