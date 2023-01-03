const express = require('express');
const router = express.Router();
const auth_middleware = require("../middleware/auth");
const game_middleware = require("../middleware/game");
const game_controller = require("../controllers/game");


router.get("/animals/facts/list", game_controller.getAvailableFactsAnimals);
router.get("/animals/facts/", game_middleware.validateAnimalFact, game_controller.getAnimalFact);
router.get("/animals/images/", game_middleware.validateAnimalImage, game_controller.getAnimalImage);

router.post("/quiz", auth_middleware(), game_controller.quizInit(false));
router.post("/quiz/guest", game_controller.quizInit(true));
router.put("/quiz/:quiz_id", game_middleware.validateQuizAnswer, game_controller.quizAnswer);

router.post("/hangman", auth_middleware(), game_controller.hangmanInit(false));
router.post("/hangman/guest", game_controller.hangmanInit(true));
router.put("/hangman/:game_id", game_middleware.validateHangmanAnswer, game_controller.hangmanAttempt);

router.post("/memory", auth_middleware(), game_controller.memoryInit(false));
router.post("/memory/guest", game_controller.memoryInit(true));
router.put("/memory/:game_id", game_middleware.validateMemoryAnswer, game_controller.memoryAttempt);

module.exports = router;
