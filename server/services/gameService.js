const GameState = require("../models/gameState");
const Team = require("../models/Team");
const Question = require("../models/Question");
const { getIO } = require("../config/socket");
const logger = require("../utils/logger");
const socketService = require("../config/socket");

// Initialize game state
const initializeGameState = async () => {
  try {
    let gameState = await GameState.findOne();

    if (!gameState) {
      gameState = new GameState({
        currentRound: 0,
        isRegistrationOpen: true,
        roundStartTime: null,
        roundEndTime: null,
      });
      await gameState.save();
      logger.info("Game state initialized");
    }

    return gameState;
  } catch (error) {
    logger.error("Error initializing game state:", error);
    throw error;
  }
};

const submitAnswer = async (teamId, roundNumber, questionNumber, answer) => {
  try {
    // Validate the team
    const team = await Team.findById(teamId);
    if (!team) {
      throw new Error("Team not found");
    }

    // Check if already answered
    if (team.hasAnsweredQuestion(roundNumber, questionNumber)) {
      throw new Error("Question already answered correctly");
    }

    // Get the question
    const question = await Question.findOne({
      round: roundNumber,
      questionNumber: questionNumber,
    });
    if (!question) {
      throw new Error("Question not found");
    }

    // Verify game state
    const gameState = await GameState.findOne();
    if (gameState.currentRound !== roundNumber) {
      throw new Error("This round is not active");
    }

    if (Date.now() > gameState.roundEndTime) {
      throw new Error("Round has ended");
    }

    let isCorrect = false;
    let pointsEarned = 0;
    let currentTotalScore = team.totalScore; // Store current score for comparison

    // Special handling for round 3
    if (roundNumber === 3) {
      const challengeNumber = questionNumber;
      if (!team.canAttemptQuestion(roundNumber, challengeNumber)) {
        throw new Error("Maximum attempts reached for this challenge");
      }

      // Increment attempts
      await Team.updateOne(
        { _id: teamId },
        {
          $inc: {
            [`currentQuestion.round3.challenge${challengeNumber}Attempts`]: 1,
          },
        }
      );

      isCorrect = answer.toLowerCase() === question.answer.toLowerCase();
      if (isCorrect) {
        const attempts =
          team.currentQuestion.round3[`challenge${challengeNumber}Attempts`];
        const pointsMap = { 0: 30, 1: 20, 2: 10 };
        pointsEarned = pointsMap[attempts];

        await Team.updateOne(
          { _id: teamId },
          {
            $inc: {
              [`scores.round3.challenge${challengeNumber}`]: pointsEarned,
            },
            $push: { "answeredQuestions.round3": questionNumber },
            $set: { scoreUpdatedAt: new Date() }, // Update the timestamp
          }
        );
      }
    } else {
      // Normal rounds (1 and 2)
      isCorrect = answer.toLowerCase() === question.answer.toLowerCase();
      if (isCorrect) {
        pointsEarned = question.points;
        await Team.updateOne(
          { _id: teamId },
          {
            $inc: { [`scores.round${roundNumber}`]: pointsEarned },
            $set: {
              [`currentQuestion.round${roundNumber}`]: questionNumber,
              scoreUpdatedAt: new Date(), // Update the timestamp
            },
            $push: {
              [`answeredQuestions.round${roundNumber}`]: questionNumber,
            },
          }
        );
      }
    }

    // If points were earned, update scores via socket
    // If points were earned, update leaderboard
    if (isCorrect && pointsEarned > 0) {
      try {
        const socketService = require("../config/socket");
        await socketService.updateLeaderboard();
      } catch (socketError) {
        logger.error("Error updating leaderboard:", socketError);
      }
    }

    return {
      isCorrect,
      pointsEarned,
      nextQuestion: isCorrect ? questionNumber + 1 : questionNumber,
    };
  } catch (error) {
    logger.error("Error in submitAnswer:", error);
    throw error;
  }
};

// Get Questions
const getQuestion = async (teamId, roundNumber, questionNumber) => {
  try {
    // Verify team exists and is in the correct round
    const team = await Team.findById(teamId);
    if (!team) {
      throw new Error("Team not found");
    }

    // Verify game state
    const gameState = await GameState.findOne();
    if (gameState.currentRound !== roundNumber) {
      throw new Error("This round is not active");
    }

    // Get the question
    const question = await Question.findOne({
      round: roundNumber,
      questionNumber,
    });
    if (!question) {
      throw new Error("Question not found");
    }

    // For security, don't send the answer to the client
    const questionData = {
      round: question.round,
      questionNumber: question.questionNumber,
      content: question.content,
      hints: question.hints || [],
      points: question.points,
    };

    return questionData;
  } catch (error) {
    logger.error("Error getting question:", error);
    throw error;
  }
};

const getAllQuestionsByRound = async (teamId, roundNumber) => {
  try {
    const team = await Team.findById(teamId);
    if (!team) {
      throw new Error("Team not found");
    }

    const parsedRound = parseInt(roundNumber);

    const questions = await Question.find({ round: parsedRound })
      .select("-answer")
      .sort({ questionNumber: 1 });

    if (!questions || questions.length === 0) {
      throw new Error(`No questions found for round ${parsedRound}`);
    }

    const questionsWithStatus = questions.map((question) => ({
      ...question.toObject(),
      isAnswered: team.hasAnsweredQuestion(
        parsedRound,
        question.questionNumber
      ),
      isSkipped: team.hasSkippedQuestion(parsedRound, question.questionNumber),
    }));

    return questionsWithStatus;
  } catch (error) {
    logger.error("Error getting questions by round:", error);
    throw error;
  }
};

// Skip a question
const skipQuestion = async (teamId, roundNumber, questionNumber) => {
  try {
    if (roundNumber === 3) {
      throw new Error("Cannot skip questions in round 3");
    }

    const team = await Team.findById(teamId);
    if (!team) {
      throw new Error("Team not found");
    }

    await Team.updateOne(
      { _id: teamId },
      {
        $set: { [`currentQuestion.round${roundNumber}`]: questionNumber + 1 },
      }
    );

    return { success: true, nextQuestion: questionNumber + 1 };
  } catch (error) {
    logger.error("Error skipping question:", error);
    throw error;
  }
};

// Update leaderboard
const updateLeaderboard = async () => {
  try {
    // Fetch all teams
    const teams = await Team.find(
      {},
      {
        teamName: 1,
        scores: 1,
        memberOne: 1,
        memberTwo: 1,
        collegeName: 1,
        scoreUpdatedAt: 1, // Include the timestamp field
      }
    );

    // Calculate total scores and prepare data with round-wise scores
    const leaderboardData = teams.map((team) => {
      // Calculate round3 total for convenience
      const round3Total =
        team.scores.round3.challenge1 + team.scores.round3.challenge2;

      // Calculate total score
      const totalScore = team.scores.round1 + team.scores.round2 + round3Total;

      return {
        teamName: team.teamName,
        collegeName: team.collegeName,
        // Include both detailed scores and total score
        scores: {
          round1: team.scores.round1,
          round2: team.scores.round2,
          round3: {
            challenge1: team.scores.round3.challenge1,
            challenge2: team.scores.round3.challenge2,
            total: round3Total,
          },
        },
        totalScore: totalScore, // Keep the totalScore field for backward compatibility
        teamMembers: [team.memberOne, team.memberTwo].filter(Boolean),
        scoreUpdatedAt: team.scoreUpdatedAt || team.createdAt, // Fallback to createdAt if scoreUpdatedAt is not available
      };
    });

    // Custom sort: first by score (descending), then by timestamp (ascending)
    leaderboardData.sort((a, b) => {
      if (b.totalScore !== a.totalScore) {
        return b.totalScore - a.totalScore; // Higher score first
      }
      // If scores are equal, team that reached the score first gets priority
      return new Date(a.scoreUpdatedAt) - new Date(b.scoreUpdatedAt);
    });

    // Return top 10
    return leaderboardData.slice(0, 10);
  } catch (error) {
    logger.error("Error updating leaderboard:", error);
    throw error;
  }
};

const getCurrentGameState = async () => {
  try {
    const gameState = await GameState.findOne();

    if (!gameState) {
      return {
        currentRound: 0,
        isGameActive: false,
      };
    }

    return {
      _id: gameState._id,
      currentRound: gameState.currentRound,
      isRegistrationOpen: gameState.isRegistrationOpen,
      isGameActive: gameState.isGameActive,
      isPaused: gameState.isPaused,
      __v: gameState.__v,
      roundEndTime: gameState.roundEndTime,
      roundStartTime: gameState.roundStartTime,
      remainingTime: gameState.remainingTime,
    };
  } catch (error) {
    logger.error("Get game state error:", error);
    throw error;
  }
};

const getCurrentRound = async () => {
  try {
    const gameState = await GameState.findOne();
    return {
      currentRound: gameState ? gameState.currentRound : 0,
      isGameActive: gameState ? gameState.isGameActive : false,
    };
  } catch (error) {
    logger.error("Get current round error:", error);
    throw error;
  }
};

const getRegistrationStatus = async () => {
  try {
    const gameState = await GameState.findOne();
    return {
      isRegistrationOpen: gameState ? gameState.isRegistrationOpen : false,
    };
  } catch (error) {
    logger.error("Get registration status error:", error);
    throw error;
  }
};

module.exports = {
  initializeGameState,
  submitAnswer,
  getQuestion,
  skipQuestion,
  updateLeaderboard,
  getAllQuestionsByRound,
  getCurrentGameState,
  getCurrentRound,
  getRegistrationStatus,
};
