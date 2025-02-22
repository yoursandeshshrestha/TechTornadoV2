const mongoose = require("mongoose");

const gameStateSchema = new mongoose.Schema({
  currentRound: { type: Number, default: 0 },
  isRegistrationOpen: { type: Boolean, default: false },
  isGameActive: { type: Boolean, default: false },
  roundStartTime: { type: Date },
  roundEndTime: { type: Date },
  remainingTime: { type: Number }, // Store remaining time when paused
  isPaused: { type: Boolean, default: false },
});

module.exports = mongoose.model("GameState", gameStateSchema);
