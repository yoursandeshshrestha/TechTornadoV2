const gameService = require("../services/gameService");
const logger = require("../utils/logger");

const handleSubmitAnswer = async (req, res) => {
  try {
    const { roundNumber, questionNumber, answer } = req.body;
    const teamId = req.team.id;

    const result = await gameService.submitAnswer(
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

    const question = await gameService.getQuestion(
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

    const questions = await gameService.getAllQuestionsByRound(
      teamId,
      roundNumber
    );

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

    const result = await gameService.skipQuestion(
      teamId,
      roundNumber,
      questionNumber
    );

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
    const leaderboard = await gameService.updateLeaderboard();
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

const getCurrentGameState = async (req, res) => {
  try {
    const gameState = await gameService.getCurrentGameState();
    res.json(gameState);
  } catch (error) {
    logger.error("Get game state error:", error);
    res.status(400).json({ message: error.message });
  }
};

const getRegistrationStatus = async (req, res) => {
  try {
    const status = await gameService.getRegistrationStatus();
    res.json(status);
  } catch (error) {
    logger.error("Get registration status error:", error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  handleSubmitAnswer,
  handleSkipQuestion,
  handleGetLeaderboard,
  handleGetAllQuestionsByRound,
  handleGetQuestion,
  getCurrentGameState,
  getRegistrationStatus,
};
