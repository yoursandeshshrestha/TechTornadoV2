const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    round: {
      type: Number,
      required: true,
      enum: [1, 2, 3],
    },
    questionNumber: {
      type: Number,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    points: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    hints: {
      type: Array,
    },
  },
  {
    timestamps: true,
  }
);

questionSchema.index({ round: 1, questionNumber: 1 }, { unique: true });

questionSchema.post("save", function (error, doc, next) {
  if (error.name === "MongoServerError" && error.code === 11000) {
    next(
      new Error(
        `Question number ${doc.questionNumber} already exists in round ${doc.round}`
      )
    );
  } else {
    next(error);
  }
});

const Question = mongoose.model("Question", questionSchema);
module.exports = Question;
