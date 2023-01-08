const mongoose = require("mongoose");

const quizSchema = mongoose.Schema({
    questions: [{
        text: String,
        answers: [String],
        correct_answer: String,
    }],
    current_question: Number,
    correct_answers: Number,
    player_username: String
});

module.exports = mongoose.model("quiz", quizSchema);
