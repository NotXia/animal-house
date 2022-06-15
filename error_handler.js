const { error } = require("./utilities");
const validator = require("express-validator");

function errorHandler(err, req, res, next) {
    if (err) {
        switch (err.code) {
            case 400:
            case 401:
            case 403:
            case 404:
                return res.status(err.code).send({ message: err.message });
            default:
                return res.status(500).send();
        }
    }
    else {
        return next();
    }
}

module.exports = errorHandler;