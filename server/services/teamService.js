const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Team = require("../models/Team");
const GameState = require("../models/gameState");

const registerTeam = async (teamData) => {
  try {
    const gameState = await GameState.findOne();
    if (!gameState || !gameState.isRegistrationOpen) {
      throw new Error("Registration is closed");
    }

    const existingTeam = await Team.findOne({ teamName: teamData.teamName });
    if (existingTeam) {
      throw new Error("Team name already exists");
    }

    const hashedPassword = await bcrypt.hash(teamData.password, 10);

    const team = new Team({
      ...teamData,
      password: hashedPassword,
    });

    await team.save();

    const token = jwt.sign({ teamId: team._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    return token;
  } catch (error) {
    if (error.code === 11000) {
      throw new Error("Team name already exists");
    }
    throw error;
  }
};

module.exports = { registerTeam };
