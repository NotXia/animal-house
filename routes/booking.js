const express = require('express');
const router = express.Router();
const auth_middleware = require("../middleware/auth");
const booking_middleware = require("../middleware/booking");
const booking_controller = require("../controllers/booking");


module.exports = router;