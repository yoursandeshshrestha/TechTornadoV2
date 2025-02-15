const Admin = require("../models/Admin");
const Team = require("../models/Team");
const GameState = require("../models/gameState");
const { getIO } = require("../config/socket");
const { getRoundDuration } = require("../utils/helpers");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");
const Question = require("../models/Question");

const registerAdmin = async (username, password) => {
  // Check if admin already exists
  const existingAdmin = await Admin.findOne({ username });
  if (existingAdmin) {
    throw new Error("Admin already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new admin
  const admin = new Admin({
    username,
    password: hashedPassword,
  });

  await admin.save();

  // Generate token
  const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET);

  return {
    message: "Admin registered successfully",
    token,
  };
};

const loginAdmin = async (username, password) => {
  const admin = await Admin.findOne({ username });
  if (!admin) throw new Error("Admin not found");

  const validPassword = await bcrypt.compare(password, admin.password);
  if (!validPassword) throw new Error("Invalid password");

  return jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET);
};

const startRound = async (round) => {
  const duration = getRoundDuration(round);
  const endTime = new Date(Date.now() + duration);

  await GameState.updateOne(
    {},
    {
      currentRound: round,
      roundStartTime: new Date(),
      roundEndTime: endTime,
    }
  );

  getIO().emit("roundStart", { round, endTime });

  // Schedule round end
  setTimeout(async () => {
    await endRound(round);
  }, duration);

  return { message: `Round ${round} started`, endTime };
};

const endRound = async (round) => {
  await GameState.updateOne(
    {},
    {
      currentRound: round < 3 ? round + 1 : 3,
      roundStartTime: null,
      roundEndTime: null,
    }
  );

  getIO().emit("roundEnd", { round });
};

const getScores = async () => {
  try {
    const teams = await Team.find({}, "teamName scores currentRound");

    if (!teams || teams.length === 0) {
      return {
        success: false,
        message: "No teams found in the database",
        data: null,
      };
    }

    return {
      success: true,
      message: "Teams retrieved successfully",
      data: teams,
    };
  } catch (error) {
    return {
      success: false,
      message: "Error retrieving teams: " + error.message,
      data: null,
    };
  }
};

module.exports = { getScores };

const createQuestion = async (questionData) => {
  const question = new Question(questionData);
  await question.save();
  return question;
};

const getAllQuestions = async () => {
  const questions = await Question.find().sort({ round: 1, questionNumber: 1 });
  return questions;
};

const getQuestionsByRound = async (round) => {
  const questions = await Question.find({ round }).sort({ questionNumber: 1 });
  return questions;
};

const updateQuestion = async (questionId, updateData) => {
  const question = await Question.findByIdAndUpdate(questionId, updateData, {
    new: true,
    runValidators: true,
  });
  if (!question) {
    throw new Error("Question not found");
  }
  return question;
};

const deleteQuestion = async (questionId) => {
  const question = await Question.findByIdAndDelete(questionId);
  if (!question) {
    throw new Error("Question not found");
  }
  return { message: "Question deleted successfully" };
};

module.exports = {
  registerAdmin,
  loginAdmin,
  startRound,
  endRound,
  getScores,
  createQuestion,
  getAllQuestions,
  getQuestionsByRound,
  updateQuestion,
  deleteQuestion,
};
