const mongoose = require("mongoose");

const gameStateSchema = new mongoose.Schema({
  currentRound: { type: Number, default: 0 },
  isRegistrationOpen: { type: Boolean, default: false },
  isGameActive: { type: Boolean, default: false },
  roundStartTime: { type: Date },
  roundEndTime: { type: Date },
});

module.exports = mongoose.model("GameState", gameStateSchema);
