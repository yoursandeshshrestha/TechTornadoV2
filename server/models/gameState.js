const mongoose = require("mongoose");

const gameStateSchema = new mongoose.Schema({
  currentRound: { type: Number, default: 1 },
  isRegistrationOpen: { type: Boolean, default: true },
  isGameActive: { type: Boolean, default: false },
  roundStartTime: { type: Date },
  roundEndTime: { type: Date },
});

module.exports = mongoose.model("GameState", gameStateSchema);
