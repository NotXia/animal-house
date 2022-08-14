const express = require('express');
const router = express.Router();
const auth_middleware = require("../middleware/auth");
const species_middleware = require("../middleware/species");
const species_controller = require("../controllers/species");

// Router per le specie
router.post("/", [ auth_middleware([ ["operator"] ], [ ["admin"] ]), species_middleware.validateAddSpecies ], species_controller.addSpecies);

router.get("/", species_middleware.validateGetSpecies, species_controller.getSpecies);
