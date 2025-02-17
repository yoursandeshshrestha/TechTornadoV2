const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Team = require("../models/Team");
const gameState = require("../models/gameState");

const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
      return res.status(401).json({ message: "Admin authentication required" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.adminId);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid admin token" });
  }
};

const authenticateTeam = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Team authentication required" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const team = await Team.findById(decoded.teamId);

      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }

      const currentGameState = await gameState.findOne(); // Renamed variable

      if (!currentGameState) {
        return res.status(400).json({ message: "Game state not found" });
      }

      req.team = team;
      next();
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError);
      return res.status(401).json({
        message: "Invalid team token",
        error:
          process.env.NODE_ENV === "development" ? jwtError.message : undefined,
      });
    }
  } catch (error) {
    console.error("General error:", error);
    res.status(401).json({
      message: "Invalid team token",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  authenticateAdmin,
  authenticateTeam,
};
