const mongoose = require("mongoose");

const memoryRankSchema = mongoose.Schema({
    player: String,
    points: Number,
});

module.exports = mongoose.model("memory_ranking", memoryRankSchema);
