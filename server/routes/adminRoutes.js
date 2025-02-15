const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { authenticateAdmin } = require("../middleware/auth");

router.post("/register", adminController.register);
router.post("/login", adminController.login);
router.get("/scores", authenticateAdmin, adminController.getScores);
router.post("/questions", authenticateAdmin, adminController.createQuestion);
router.get("/questions", authenticateAdmin, adminController.getAllQuestions);
router.get(
  "/questions/:round",
  authenticateAdmin,
  adminController.getQuestionsByRound
);
router.put("/questions/:id", authenticateAdmin, adminController.updateQuestion);
router.delete(
  "/questions/:id",
  authenticateAdmin,
  adminController.deleteQuestion
);
router.post(
  "/registration/open",
  authenticateAdmin,
  adminController.openRegistration
);
router.post(
  "/registration/close",
  authenticateAdmin,
  adminController.closeRegistration
);
router.get(
  "/registration/status",

  adminController.getRegistrationStatus
);

module.exports = router;
