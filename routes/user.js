const express = require('express');
const router = express.Router();

const user_controller = require("../controllers/user");

router.post("/operators", user_controller.insertOperator);
router.get("/operators/:username", searchUser(true));
router.put("/operators/:username", user_controller.update);
router.delete("/operators/:username", deleteUser(true));

router.post("/customers", user_controller.insertCustomer);
router.get("/customers/:username", searchUser(false));
router.put("/customers/:username", user_controller.update);
router.delete("/customers/:username", deleteUser(false));


module.exports = router;