const mongoose = require("mongoose");

const hangmanSchema = mongoose.Schema({
    word: String,
    attempts: [String],
    correct_attempts: Number,
    player_username: String
});

module.exports = mongoose.model("hangman", hangmanSchema);
