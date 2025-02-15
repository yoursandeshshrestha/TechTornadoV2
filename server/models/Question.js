const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  round: { type: Number, required: true },
  questionNumber: { type: Number, required: true },
  content: { type: String, required: true },
  answer: { type: String, required: true },
  type: { type: String },
  points: { type: Number, required: true },
  hints: [{ type: String }],
});

module.exports = mongoose.model("Question", questionSchema);
