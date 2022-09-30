const express = require('express');
const router = express.Router();
const game_middleware = require("../middleware/game");
const game_controller = require("../controllers/game");


router.get("/animals/facts/", game_middleware.validateAnimalFact, game_controller.getAnimalFact);
router.get("/animals/images/", game_middleware.validateAnimalImage, game_controller.getAnimalImage);

module.exports = router;
