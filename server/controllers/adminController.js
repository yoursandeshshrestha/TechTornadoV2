const adminService = require("../services/adminService");
const logger = require("../utils/logger");

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

module.exports = {
  register,
  login,
  getScores,
};
