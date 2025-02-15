const mongoose = require("mongoose");

const gameStateSchema = new mongoose.Schema({
  currentRound: { type: Number, default: 1 },
  isRegistrationOpen: { type: Boolean, default: true },
  roundStartTime: { type: Date },
  roundEndTime: { type: Date },
});

module.exports = mongoose.model("GameState", gameStateSchema);
