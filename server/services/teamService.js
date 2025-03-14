const Team = require("../models/Team");
const GameState = require("../models/gameState");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");
const socketService = require("../config/socket");

const generateToken = (teamId) => {
  return jwt.sign({ teamId }, process.env.JWT_SECRET, { expiresIn: "24h" });
};

const registerTeam = async (teamData) => {
  try {
    logger.info(`Attempting to register team: ${teamData.teamName}`);

    // Check registration status
    const gameState = await GameState.findOne();
    if (!gameState) {
      logger.error("Game state not found");
      throw new Error("Registration is not available at this time");
    }

    if (!gameState.isRegistrationOpen) {
      logger.info("Registration attempt when registration is closed");
      throw new Error("Registration is currently closed");
    }

    // Check if team name already exists
    const existingTeam = await Team.findOne({ teamName: teamData.teamName });
    if (existingTeam) {
      logger.info(`Team name already exists: ${teamData.teamName}`);
      throw new Error("Team name already exists");
    }

    // Validate required fields
    const requiredFields = [
      "teamName",
      "collegeName",
      "memberOne",
      "memberTwo",
      "password",
    ];
    const missingFields = requiredFields.filter((field) => !teamData[field]);
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }

    // Hash password with a specific salt rounds
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(teamData.password, saltRounds);
    logger.info("Password hashed successfully");

    // Create new team with hashed password
    const team = new Team({
      teamName: teamData.teamName,
      collegeName: teamData.collegeName,
      memberOne: teamData.memberOne,
      memberTwo: teamData.memberTwo,
      password: hashedPassword,
      currentRound: gameState.currentRound || 1,
      scores: {
        round1: 0,
        round2: 0,
        round3: {
          challenge1: 0,
          challenge2: 0,
        },
      },
    });

    await team.save();
    logger.info(`Team registered successfully: ${team.teamName}`);

    // Update leaderboard in real-time
    try {
      await socketService.updateLeaderboard();
    } catch (socketError) {
      logger.error(
        "Error updating leaderboard after team registration:",
        socketError
      );
    }

    // Generate token
    const token = generateToken(team._id);

    return token;
  } catch (error) {
    logger.error("Team registration error:", error);
    throw error;
  }
};

const loginTeam = async (teamName, password) => {
  try {
    logger.info(`Login attempt for team: ${teamName}`);

    // Find team by name
    const team = await Team.findOne({ teamName }).select("+password");
    if (!team) {
      logger.info(`Team not found: ${teamName}`);
      throw new Error("Invalid credentials");
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, team.password);
    logger.info(`Password valid: ${isPasswordValid}`);

    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    // Get current game state
    const gameState = await GameState.findOne();
    if (gameState) {
      team.currentRound = gameState.currentRound;
      await team.save();
    }

    // Generate token
    const token = generateToken(team._id);
    logger.info("Login successful, token generated");

    return {
      token,
      team: {
        id: team._id,
        teamName: team.teamName,
        collegeName: team.collegeName,
        memberOne: team.memberOne,
        memberTwo: team.memberTwo,
        currentRound: team.currentRound,
        scores: team.scores,
      },
    };
  } catch (error) {
    logger.error("Team login error:", error);
    throw error;
  }
};

module.exports = {
  registerTeam,
  loginTeam,
};
