const express = require("express");
const router = express.Router();
const { authenticateAdmin } = require("../middleware/auth");
const {
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
  getTeams,
  getTeamById,
  deleteTeam,
} = require("../controllers/adminController");

// Auth routes
router.post("/register", register);
router.post("/login", login);

// Protected routes - require admin authentication
router.get("/scores", getScores);

// Question Related Routes
router.post("/questions", authenticateAdmin, createQuestion);
router.get("/questions", authenticateAdmin, getAllQuestions);
router.get("/questions/round/:round", authenticateAdmin, getQuestionsByRound);
router.put("/questions/:id", authenticateAdmin, updateQuestion);
router.delete("/questions/:id", authenticateAdmin, deleteQuestion);
router.post("/questions/bulk", authenticateAdmin, createBulkQuestions);

// Round Related
router.post("/round/start", authenticateAdmin, startRound);
router.post("/round/terminate", authenticateAdmin, terminateRoundController);

// Toggle Registration
router.post("/registration/open", authenticateAdmin, openRegistration);
router.post("/registration/close", authenticateAdmin, closeRegistration);

// Team Related Routes - Add these new routes
router.get("/teams", authenticateAdmin, getTeams);
router.get("/teams/:id", authenticateAdmin, getTeamById);
router.delete("/teams/:id", authenticateAdmin, deleteTeam);

module.exports = router;
