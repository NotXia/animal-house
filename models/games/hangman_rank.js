const mongoose = require("mongoose");

const hangmanRankSchema = mongoose.Schema({
    player: String,
    points: Number,
});

module.exports = mongoose.model("hangman_ranking", hangmanRankSchema);
