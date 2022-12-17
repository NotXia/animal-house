const mongoose = require("mongoose");

const quizRankSchema = mongoose.Schema({
    player: String,
    points: Number,
});

module.exports = mongoose.model("quiz_ranking", quizRankSchema);
