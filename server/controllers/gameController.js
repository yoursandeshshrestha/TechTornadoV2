const {
  submitAnswer,
  skipQuestion,
  getQuestion,
  updateLeaderboard,
  getAllQuestionsByRound,
} = require("../services/gameService");
const logger = require("../utils/logger");
const Question = require("../models/Question");

const handleSubmitAnswer = async (req, res) => {
  try {
    const { roundNumber, questionNumber, answer } = req.body;
    const teamId = req.team.id;

    const result = await submitAnswer(
      teamId,
      roundNumber,
      questionNumber,
      answer
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error("Submit answer error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const handleGetQuestion = async (req, res) => {
  try {
    const { roundNumber, questionNumber } = req.params;
    const teamId = req.team.id;

    const question = await getQuestion(
      teamId,
      parseInt(roundNumber),
      parseInt(questionNumber)
    );

    res.json({
      success: true,
      data: question,
    });
  } catch (error) {
    logger.error("Get question error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const handleGetAllQuestionsByRound = async (req, res) => {
  try {
    const { roundNumber } = req.params;
    const teamId = req.team.id;

    const questions = await getAllQuestionsByRound(teamId, roundNumber);

    res.json({
      success: true,
      data: questions,
    });
  } catch (error) {
    logger.error("Get all questions error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch questions.",
    });
  }
};

const handleSkipQuestion = async (req, res) => {
  try {
    const { roundNumber, questionNumber } = req.body;
    const teamId = req.team.id;

    const result = await skipQuestion(teamId, roundNumber, questionNumber);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error("Skip question error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const handleGetLeaderboard = async (req, res) => {
  try {
    const leaderboard = await updateLeaderboard();
    res.json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    logger.error("Get leaderboard error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  handleSubmitAnswer,
  handleSkipQuestion,
  handleGetLeaderboard,
  handleGetAllQuestionsByRound,
  handleGetQuestion,
};
