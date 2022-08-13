const utils = require("./utils");
const { REQUIRED, OPTIONAL } = require("./validators/utils");
const validator = require("express-validator");
const hub_validator = require("./validators/hub");
const service_validator = require("./validators/service");
const booking_validator = require("./validators/booking");
const user_validator = require("./validators/user");
const animal_validator = require("./validators/animal");

const validateInsertAppointment = [
    booking_validator.validateTimeSlot("body", REQUIRED, "time_slot"),
    service_validator.validateServiceId("body", REQUIRED, "service_id"),
    user_validator.validateUsername("body", REQUIRED, "customer"),
    animal_validator.validateAnimalId("body", REQUIRED, "animal_id"),
    user_validator.validateUsername("body", REQUIRED, "operator"),
    hub_validator.validateCode("body", REQUIRED, "hub"),
    utils.validatorErrorHandler
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
    utils.validatorErrorHandler
]

const validateGetAppointmentsByUser = [
    user_validator.validateUsername("query", REQUIRED, "username"),
    utils.validatorErrorHandler
]

const validateDeleteAppointment = [
    booking_validator.validateAppointmentId("param", REQUIRED, "appointment_id"),
    utils.validatorErrorHandler
]

module.exports = {
    validateInsertAppointment: validateInsertAppointment,
    validateSearchAvailabilities: validateSearchAvailabilities,
    validateGetAppointmentById: validateGetAppointmentById,
    validateGetAppointmentsByUser: validateGetAppointmentsByUser,
    validateDeleteAppointment: validateDeleteAppointment
}