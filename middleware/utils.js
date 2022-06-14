const validator = require("express-validator");
const { error } = require("../utilities");

const errorHandler = [
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

function verifyMimetype(valid_mimes) {
    return function (req, res, next) {
        for (const [key, file] of Object.entries(req.files)) {
            if (!valid_mimes.includes(file.mimetype)) {
                return next(new Error("Formato del file non valido"));
            }
        }
        return next();
    };
}

module.exports = {
    errorHandler: errorHandler,
    verifyMimetype: verifyMimetype,
    verifyImage: verifyMimetype(["image/jpeg", "image/png"])
}
    