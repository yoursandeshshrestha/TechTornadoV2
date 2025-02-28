const adminService = require("../services/adminService");
const { calculatePoints } = require("../utils/helpers");
const logger = require("../utils/logger");
const Question = require("../models/Question");
const GameState = require("../models/gameState");
const { updateRegistrationStatus } = require("../config/socket");
const socketService = require("../config/socket");

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
    // Get files if they exist
    const files = req.files || {};

    // Call service to create question
    const result = await adminService.createQuestion(req.body, files);

    if (!result.success) {
      const statusCode =
        result.code === "DUPLICATE_QUESTION"
          ? 409
          : result.code === "VALIDATION_ERROR"
          ? 400
          : 500;

      return res.status(statusCode).json(result);
    }

    return res.status(201).json(result);
  } catch (error) {
    logger.error("Error in createQuestion controller:", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while creating the question",
      code: "INTERNAL_ERROR",
    });
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
    // Update socket state after successful database update
    await updateRegistrationStatus("open");
    res.json(result);
  } catch (error) {
    logger.error("Open registration error:", error);
    res.status(400).json({ message: error.message });
  }
};

const closeRegistration = async (req, res) => {
  try {
    const result = await adminService.closeRegistration();
    // Update socket state after successful database update
    await updateRegistrationStatus("closed");
    res.json(result);
  } catch (error) {
    logger.error("Close registration error:", error);
    res.status(400).json({ message: error.message });
  }
};

const createBulkQuestions = async (req, res) => {
  try {
    const questions = req.body;

    // Validate input
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of questions",
      });
    }

    // Validate each question and prepare data
    const validationErrors = [];
    const preparedQuestions = [];

    questions.forEach((question, index) => {
      const { round, questionNumber, content, answer, hints } = question;

      // Check required fields
      if (!round || !questionNumber || !content || !answer) {
        validationErrors.push({
          index,
          message:
            "Missing required fields: round, questionNumber, content, and answer",
        });
        return;
      }

      // Validate round number
      if (![1, 2, 3].includes(round)) {
        validationErrors.push({
          index,
          message: "Round must be 1, 2, or 3",
        });
      }

      // Validate question number
      if (questionNumber < 1) {
        validationErrors.push({
          index,
          message: "Question number must be a positive number",
        });
      }

      // Validate hints if provided
      if (hints && !Array.isArray(hints)) {
        validationErrors.push({
          index,
          message: "Hints must be provided as an array",
        });
      }

      // If no validation errors for this question, prepare it
      if (!validationErrors.some((error) => error.index === index)) {
        const questionData = {
          round,
          questionNumber,
          content,
          answer,
          points: calculatePoints(round),
        };

        // Add hints only if they are provided
        if (hints && hints.length > 0) {
          questionData.hints = hints;
        }

        preparedQuestions.push(questionData);
      }
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    // Process questions
    const result = await adminService.createBulkQuestions(preparedQuestions);

    if (!result.success) {
      if (result.message.includes("already exists in round")) {
        return res.status(409).json({
          success: false,
          message: result.message,
          code: "DUPLICATE_QUESTION",
        });
      }

      if (result.name === "ValidationError") {
        const validationErrors = Object.values(result.errors).map(
          (err) => err.message
        );
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validationErrors,
          code: "VALIDATION_ERROR",
        });
      }
    }

    return res.status(201).json(result);
  } catch (error) {
    logger.error("Bulk question creation error:", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while creating questions",
      code: "INTERNAL_ERROR",
    });
  }
};

const startRound = async (req, res) => {
  try {
    const { round } = req.body;

    // Input validation
    if (!round || !Number.isInteger(round)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid round number",
      });
    }

    // Validate round number
    if (![1, 2, 3].includes(round)) {
      return res.status(400).json({
        success: false,
        message: "Round must be 1, 2, or 3",
      });
    }

    const result = await adminService.startRound(round);
    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        round,
        endTime: result.endTime,
      },
    });
  } catch (error) {
    logger.error("Start round error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while starting the round",
      error: error.message,
    });
  }
};

const terminateRoundController = async (req, res) => {
  try {
    await adminService.terminateRound();

    res.status(200).json({
      success: true,
      message: "Round terminated successfully",
    });
  } catch (error) {
    logger.error("Error in terminateRoundController:", error);
    res.status(500).json({
      success: false,
      message: "Failed to terminate round",
    });
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
  createBulkQuestions,
  startRound,
  terminateRoundController,
};
