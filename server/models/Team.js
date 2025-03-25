const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
  {
    teamName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    collegeName: {
      type: String,
      required: true,
      trim: true,
    },
    memberOne: {
      type: String,
      required: true,
      trim: true,
    },
    memberTwo: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    currentRound: {
      type: Number,
      default: 0,
      min: 0,
      max: 3,
    },
    scores: {
      round1: {
        type: Number,
        default: 0,
        min: 0,
      },
      round2: {
        type: Number,
        default: 0,
        min: 0,
      },
      round3: {
        challenge1: {
          type: Number,
          default: 0,
          min: 0,
        },
        challenge2: {
          type: Number,
          default: 0,
          min: 0,
        },
      },
    },
    currentQuestion: {
      round1: {
        type: Number,
        default: 0,
        min: 0,
      },
      round2: {
        type: Number,
        default: 0,
        min: 0,
      },
      round3: {
        challenge1Attempts: {
          type: Number,
          default: 0,
          min: 0,
          max: 3,
        },
        challenge2Attempts: {
          type: Number,
          default: 0,
          min: 0,
          max: 3,
        },
      },
    },
    answeredQuestions: {
      round1: [{ type: Number }],
      round2: [{ type: Number }],
      round3: [{ type: Number }],
    },
    skippedQuestions: {
      round1: [{ type: Number }],
      round2: [{ type: Number }],
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    scoreUpdatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for total score
teamSchema.virtual("totalScore").get(function () {
  return (
    this.scores.round1 +
    this.scores.round2 +
    this.scores.round3.challenge1 +
    this.scores.round3.challenge2
  );
});

// Game-related methods
teamSchema.methods.canAttemptQuestion = function (roundNumber, questionNumber) {
  if (roundNumber === 3) {
    const challengeNumber = questionNumber;
    const attempts =
      this.currentQuestion.round3[`challenge${challengeNumber}Attempts`];
    return attempts < 3;
  }
  return true;
};

teamSchema.methods.hasAnsweredQuestion = function (
  roundNumber,
  questionNumber
) {
  return this.answeredQuestions[`round${roundNumber}`].includes(questionNumber);
};

teamSchema.methods.hasSkippedQuestion = function (roundNumber, questionNumber) {
  if (roundNumber === 3) return false;
  return this.skippedQuestions[`round${roundNumber}`].includes(questionNumber);
};

// Indexes
teamSchema.index({ totalScore: -1 });
teamSchema.index({ currentRound: 1 });

// Check if model exists before creating a new one
module.exports = mongoose.models.Team || mongoose.model("Team", teamSchema);
