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
  getRegistrationStatus,
  createBulkQuestions,
  startRound,
} = require("../controllers/adminController");

// Auth routes
router.post("/register", register);
router.post("/login", login);

// Protected routes - require admin authentication
router.get("/scores", authenticateAdmin, getScores);
router.post("/questions", authenticateAdmin, createQuestion);
router.get("/questions", authenticateAdmin, getAllQuestions);
router.get("/questions/round/:round", authenticateAdmin, getQuestionsByRound);
router.put("/questions/:id", authenticateAdmin, updateQuestion);
router.delete("/questions/:id", authenticateAdmin, deleteQuestion);
router.post("/questions/bulk", authenticateAdmin, createBulkQuestions);

// Registration control routes
router.post("/round/start", authenticateAdmin, startRound);
router.post("/registration/open", authenticateAdmin, openRegistration);
router.post("/registration/close", authenticateAdmin, closeRegistration);
router.get("/registration/status", getRegistrationStatus);

module.exports = router;
