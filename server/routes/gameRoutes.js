const express = require("express");
const router = express.Router();
const {
  handleSubmitAnswer,
  handleSkipQuestion,
  handleGetLeaderboard,
  handleGetQuestion,
  handleGetAllQuestionsByRound,
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
router.get("/leaderboard", handleGetLeaderboard);

module.exports = router;
