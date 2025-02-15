const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { authenticateAdmin } = require("../middleware/auth");

router.post("/register", adminController.register);
router.post("/login", adminController.login);
router.get("/scores", authenticateAdmin, adminController.getScores);

module.exports = router;
