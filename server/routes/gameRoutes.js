const express = require("express");
const router = express.Router();
const {
  handleSubmitAnswer,
  handleSkipQuestion,
  handleGetLeaderboard,
  handleGetQuestion,
  handleGetAllQuestionsByRound,
  getCurrentGameState,
  getRegistrationStatus,
} = require("../controllers/gameController");
const { authenticateTeam } = require("../middleware/auth");

router.post("/submit-answer", authenticateTeam, handleSubmitAnswer);
router.get(
  "/questions/:roundNumber/:questionNumber",
  authenticateTeam,
  handleGetQuestion
);
router.get(
  "/questionsbyround/roundNumber/:roundNumber",
  authenticateTeam,
  handleGetAllQuestionsByRound
);
router.post("/skip-question", authenticateTeam, handleSkipQuestion);

// Routes which doesn't need token
router.get("/leaderboard", handleGetLeaderboard);
router.get("/current-state", getCurrentGameState);
router.get("/registration/status", getRegistrationStatus);

module.exports = router;
