const express = require('express');
const router = express.Router();
const passport = require("passport");

require("../middleware/auth");
const auth_controller = require("../controllers/auth");


router.post("/login", passport.authenticate("local", { session: false }), auth_controller.login);
router.post("/refresh", auth_controller.refresh);
router.post("/logout", auth_controller.logout);

module.exports = router;