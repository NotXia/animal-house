const express = require('express');
const router = express.Router();
const game_middleware = require("../middleware/game");
const game_controller = require("../controllers/game");


router.get("/animals/facts/", game_middleware.validateAnimalFact, game_controller.getAnimalFact);
router.get("/animals/images/", game_middleware.validateAnimalImage, game_controller.getAnimalImage);

router.post("/quiz", auth_middleware(), game_controller.quizInit(false));
router.post("/quiz/guest", game_controller.quizInit(true));
router.put("/quiz/:quiz_id", game_middleware.validateQuizAnswer, game_controller.quizAnswer);

router.get("/hangman", auth_middleware(), game_controller.hangmanInit(false));
router.get("/hangman/guest", game_controller.hangmanInit(true));
router.get("/hangman/:game_id", game_middleware.validateHangmanAnswer, game_controller.hangmanAttempt);

module.exports = router;
