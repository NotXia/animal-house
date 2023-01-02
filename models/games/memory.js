const mongoose = require("mongoose");

const memorySchema = mongoose.Schema({
    cards: [{
        url: String,
        label: String,
        revealed: Boolean
    }],
    curr_revealed_index: Number, // La carta attualmente girata
    wrong_attempts: Number,
    player_username: String
});

memorySchema.methods.getCards = function() {
    return this.cards.map((card) => card.revealed ? {url: card.url, label: card.label} : null);
};

memorySchema.methods.gameEnded = function() {
    for (const card of this.cards) {
        if (!card.revealed) { return false; }
    }

    return true;
};

module.exports = mongoose.model("memory", memorySchema);
