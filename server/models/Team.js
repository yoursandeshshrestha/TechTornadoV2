const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  teamName: { type: String, required: true, unique: true },
  collegeName: { type: String, required: true },
  memberOne: { type: String, required: true },
  memberTwo: { type: String },
  password: { type: String, required: true },
  currentRound: { type: Number, default: 1 },
  scores: {
    round1: { type: Number, default: 0 },
    round2: { type: Number, default: 0 },
    round3: {
      challenge1: { type: Number, default: 0 },
      challenge2: { type: Number, default: 0 },
    },
  },
  currentQuestion: {
    round1: { type: Number, default: 0 },
    round2: { type: Number, default: 0 },
    round3: {
      challenge1Attempts: { type: Number, default: 0 },
      challenge2Attempts: { type: Number, default: 0 },
    },
  },
});

module.exports = mongoose.model("Team", teamSchema);
