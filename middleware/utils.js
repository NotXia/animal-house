const validator = require("express-validator");
const { error } = require("../utilities");

const validatorErrorHandler = [
    function (req, res, next) {
        const errors = validator.validationResult(req).formatWith(function ({ location, msg, param, value, nestedErrors }) {
            return {
                field: param,
                location: location,
                message: msg
            }
        });
    
        if (!errors.isEmpty()) {
            return next(error.BAD_REQUEST(errors.array()));
        }
        else {
            return next();
        }
    }
];

function verifyMimetype(valid_mimes, optional=false) {
    return function (req, res, next) {
        if (!req.files) {
            if (optional) { return next(); }
            else { return next(error.BAD_REQUEST("Nessun file caricato")); }
        }

        for (const [_, file] of Object.entries(req.files)) {
            if (!valid_mimes.includes(file.mimetype)) {
            return next(error.BAD_REQUEST("Formato del file non valido"));
            }
        }
        return next();
    };
}

module.exports = {
    validatorErrorHandler: validatorErrorHandler,
    verifyMimetype: verifyMimetype,
    verifyImage: verifyMimetype(["image/jpeg", "image/png"], false),
    verifyImageOptional: verifyMimetype(["image/jpeg", "image/png"], true)
}
    