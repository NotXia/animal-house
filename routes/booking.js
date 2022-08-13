const express = require('express');
const router = express.Router();
const auth_middleware = require("../middleware/auth");
const booking_middleware = require("../middleware/booking");
const booking_controller = require("../controllers/booking");

router.post("/", [ auth_middleware([ ["customer"] ], [ ["admin"] ]), booking_middleware.validateInsertAppointment ], booking_controller.insertAppointment);

router.get("/availabilities/", booking_middleware.validateSearchAvailabilities, booking_controller.searchAvailabilities);
router.get("/:appointment_id", booking_middleware.validateGetAppointmentById, booking_controller.getAppointmentById);
router.get("/", booking_middleware.validateGetAppointmentsByUser, booking_controller.getAppointmentsByUser);

router.delete("/:appointment_id", [ auth_middleware([ ["customer"] ], [ ["admin"] ]), booking_middleware.validateDeleteAppointment ], booking_controller.deleteAppointment);

module.exports = router;