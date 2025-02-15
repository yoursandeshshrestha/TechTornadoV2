const express = require("express");
const router = express.Router();
const teamController = require("../controllers/teamController");
const {
  registerValidation,
  validateRequest,
} = require("../middleware/validateRequest");

router.post(
  "/register",
  registerValidation,
  validateRequest,
  teamController.register
);

module.exports = router;
