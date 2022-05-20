const validator = require("express-validator");

const errorHandler = [
    function (req, res, next) {
        const errors = validator.validationResult(req);
    
        if (!errors.isEmpty()) {
            return res.sendStatus(400);
        }
        else {
            return next();
        }
    },
    function (err, req, res, next) {
        if (err) {
            return res.sendStatus(400);
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
    