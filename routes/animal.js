const express = require('express');
const router = express.Router();
const auth_middleware = require("../middleware/auth");
const animal_middleware = require("../middleware/animal");
const animal_controller = require("../controllers/animal");

// Router per gli animali

router.get("/:animal_id", animal_middleware.validateGetAnimalById, animal_controller.getAnimalById);
router.put("/:animal_id", [ auth_middleware([ ["customer"] ], [ ["admin"], ["operator"] ]), animal_middleware.validateUpdateAnimal ], animal_controller.updateAnimal);
router.delete("/:animal_id", [ auth_middleware([ ["customer"] ], [ ["admin"], ["operator"] ]), animal_middleware.validateDeleteAnimal ], animal_controller.deleteAnimal);

module.exports = router;
