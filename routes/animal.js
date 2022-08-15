const express = require('express');
const router = express.Router();
const auth_middleware = require("../middleware/auth");
const animal_middleware = require("../middleware/animal");
const animal_controller = require("../controllers/animal");

// Router per gli animali
//Post

router.get("/:animal_id", animal_middleware.validateGetAnimalById, animal_controller.getAnimalById);

module.exports = router;
