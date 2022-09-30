const express = require('express');
const router = express.Router();
const game_middleware = require("../middleware/game");
const game_controller = require("../controllers/game");


router.get("/facts/", game_middleware.validateAnimalFact, game_controller.getAnimalFact);

module.exports = router;
