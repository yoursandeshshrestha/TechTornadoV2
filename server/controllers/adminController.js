const adminService = require("../services/adminService");
const logger = require("../utils/logger");

const register = async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await adminService.registerAdmin(username, password);
    res.status(201).json(result);
  } catch (error) {
    logger.error("Admin registration error:", error);
    res.status(400).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const token = await adminService.loginAdmin(username, password);
    res.json({ token });
  } catch (error) {
    logger.error("Admin login error:", error);
    res.status(400).json({ message: error.message });
  }
};

const getScores = async (req, res) => {
  try {
    const scores = await adminService.getScores();
    res.json(scores);
  } catch (error) {
    logger.error("Get scores error:", error);
    res.status(400).json({ message: error.message });
  }
};

const createQuestion = async (req, res) => {
  try {
    const questionData = {
      round: req.body.round,
      questionNumber: req.body.questionNumber,
      content: req.body.content,
      answer: req.body.answer,
      type: req.body.type,
      points: req.body.points,
      hints: req.body.hints || [],
    };

    const question = await adminService.createQuestion(questionData);
    res.status(201).json(question);
  } catch (error) {
    logger.error("Create question error:", error);
    res.status(400).json({ message: error.message });
  }
};

const getAllQuestions = async (req, res) => {
  try {
    const questions = await adminService.getAllQuestions();
    res.json(questions);
  } catch (error) {
    logger.error("Get questions error:", error);
    res.status(400).json({ message: error.message });
  }
};

const getQuestionsByRound = async (req, res) => {
  try {
    const { round } = req.params;
    const questions = await adminService.getQuestionsByRound(parseInt(round));
    res.json(questions);
  } catch (error) {
    logger.error("Get questions by round error:", error);
    res.status(400).json({ message: error.message });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      content: req.body.content,
      answer: req.body.answer,
      type: req.body.type,
      points: req.body.points,
      hints: req.body.hints,
    };

    const question = await adminService.updateQuestion(id, updateData);
    res.json(question);
  } catch (error) {
    logger.error("Update question error:", error);
    res.status(400).json({ message: error.message });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminService.deleteQuestion(id);
    res.json(result);
  } catch (error) {
    logger.error("Delete question error:", error);
    res.status(400).json({ message: error.message });
  }
};

const openRegistration = async (req, res) => {
  try {
    const result = await adminService.openRegistration();
    res.json(result);
  } catch (error) {
    logger.error("Open registration error:", error);
    res.status(400).json({ message: error.message });
  }
};

const closeRegistration = async (req, res) => {
  try {
    const result = await adminService.closeRegistration();
    res.json(result);
  } catch (error) {
    logger.error("Close registration error:", error);
    res.status(400).json({ message: error.message });
  }
};

const getRegistrationStatus = async (req, res) => {
  try {
    const status = await adminService.getRegistrationStatus();
    res.json(status);
  } catch (error) {
    logger.error("Get registration status error:", error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
  getScores,
  createQuestion,
  getAllQuestions,
  getQuestionsByRound,
  updateQuestion,
  deleteQuestion,
  openRegistration,
  closeRegistration,
  getRegistrationStatus,
};
