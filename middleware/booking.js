const utils = require("./utils");
const { REQUIRED, OPTIONAL } = require("./validators/utils");
const validator = require("express-validator");
const hub_validator = require("./validators/hub");
const service_validator = require("./validators/service");
const booking_validator = require("./validators/booking");
const user_validator = require("./validators/user");
const animal_validator = require("./validators/animal");
const error = require("../error_handler");

const validateInsertAppointment = [
    booking_validator.validateTimeSlot("body", REQUIRED, "time_slot"),
    service_validator.validateServiceId("body", REQUIRED, "service_id"),
    user_validator.validateUsername("body", REQUIRED, "customer"),
    animal_validator.validateAnimalId("body", REQUIRED, "animal_id"),
    user_validator.validateUsername("body", REQUIRED, "operator"),
    hub_validator.validateCode("body", REQUIRED, "hub"),
    utils.validatorErrorHandler,
    async function (req, res, next) {
        if (req.auth.superuser) { return next(); }

        if ((req.body.customer != req.auth.username) && (req.body.operator != req.auth.username)) {
            return next(error.generate.FORBIDDEN("Non puoi prenotare per gli altri utenti"));
        }
        let err = await animal_validator.verifyAnimalOwnership(req.body.animal_id, req.body.customer)
        if (err) { return next(err); }

        return next();
    }
]

const validateSearchAvailabilities = [
    validator.query("start_date").exists().withMessage("Valore mancante").isISO8601().withMessage("Formato non valido"),
    validator.query("end_date").exists().withMessage("Valore mancante").isISO8601().withMessage("Formato non valido"),
    hub_validator.validateCode("query", REQUIRED, "hub_code"),
    service_validator.validateServiceId("query", REQUIRED, "service_id"),
    utils.validatorErrorHandler
]

const validateGetAppointmentById = [
    booking_validator.validateAppointmentId("param", REQUIRED, "appointment_id"),
    utils.validatorErrorHandler,
    async function (req, res, next) {
        if (req.auth.superuser) { return next(); }

        let err = await booking_validator.verifyAppointmentOwnership(req.params.appointment_id, req.auth.username);
        if (err) { return next(err); }

        return next();
    }
]

const validateGetAppointmentsByUser = [
    user_validator.validateUsername("query", REQUIRED, "username"),
    utils.validatorErrorHandler,
    function (req, res, next) {
        if (req.auth.superuser) { return next(); }

        if (req.query.username !== req.auth.username) { return next(error.generate.FORBIDDEN("Non puoi ricercare gli appuntamenti altrui")); }

        return next();
    }
]

const validateDeleteAppointment = [
    booking_validator.validateAppointmentId("param", REQUIRED, "appointment_id"),
    utils.validatorErrorHandler,
    async function (req, res, next) {
        if (req.auth.superuser) { return next(); }

        let err = await booking_validator.verifyAppointmentOwnership(req.params.appointment_id, req.auth.username);
        if (err) { return next(err); }

        return next();
    }
];

const validateCheckout  = [
    booking_validator.validateAppointmentId("param", REQUIRED, "appointment_id"),
    utils.validatorErrorHandler,
    async function (req, res, next) {
        if (req.auth.superuser) { return next(); }

        let err = await booking_validator.verifyAppointmentOwnership(req.params.appointment_id, req.auth.username);
        if (err) { return next(err); }

        return next();
    }
];

const validateSuccess = [
    booking_validator.validateAppointmentId("param", REQUIRED, "appointment_id"),
    utils.validatorErrorHandler
]

module.exports = {
    validateInsertAppointment: validateInsertAppointment,
    validateSearchAvailabilities: validateSearchAvailabilities,
    validateGetAppointmentById: validateGetAppointmentById,
    validateGetAppointmentsByUser: validateGetAppointmentsByUser,
    validateDeleteAppointment: validateDeleteAppointment,
    validateCheckout: validateCheckout,
    validateSuccess: validateSuccess
}