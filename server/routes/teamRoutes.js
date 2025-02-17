const express = require("express");
const router = express.Router();
const teamController = require("../controllers/teamController");
const {
  registerValidation,
  validateRequest,
  loginValidation,
} = require("../middleware/validateRequest");

router.post(
  "/register",
  registerValidation,
  validateRequest,
  teamController.register
);
router.post("/login", loginValidation, validateRequest, teamController.login);

module.exports = router;
