const socketIo = require("socket.io");
const logger = require("../utils/logger");
const Team = require("../models/Team");
const GameState = require("../models/gameState");

let io;
let gameState = {
  gameStatus: "Stopped",
  isRegistrationOpen: false,
  currentRound: 0,
  activeUsers: 0,
  endTime: null,
};

// Initialize state from database
const initializeGameState = async () => {
  try {
    const dbGameState = await GameState.findOne();
    if (dbGameState) {
      gameState = {
        gameStatus: dbGameState.currentRound > 0 ? "In Progress" : "Stopped",
        isRegistrationOpen: dbGameState.isRegistrationOpen,
        currentRound: dbGameState.currentRound,
        activeUsers: 0,
        endTime: dbGameState.roundEndTime,
      };
    }
    logger.info("Game state initialized:", gameState);
  } catch (error) {
    logger.error("Error initializing game state:", error);
  }
};

// Helper function to get current game state from DB
const getCurrentGameState = async () => {
  const dbGameState = await GameState.findOne();
  return {
    gameStatus: dbGameState.currentRound > 0 ? "In Progress" : "Stopped",
    isRegistrationOpen: dbGameState.isRegistrationOpen,
    currentRound: dbGameState.currentRound,
    isGameActive: dbGameState.isGameActive,
    endTime: dbGameState.roundEndTime,
  };
};

// Helper function to broadcast current game state
const broadcastGameState = async () => {
  if (!io) return;

  try {
    const currentState = await getCurrentGameState();
    io.emit("gameStateUpdate", currentState);
    logger.info("Broadcasting game state:", currentState);
  } catch (error) {
    logger.error("Error broadcasting game state:", error);
  }
};

// Update leaderboard with preserved game state
const updateLeaderboard = async () => {
  try {
    const teams = await Team.find(
      {},
      {
        teamName: 1,
        scores: 1,
        memberOne: 1,
        memberTwo: 1,
        collegeName: 1,
      }
    ).lean();

    const leaderboardData = teams
      .map((team) => ({
        teamName: team.teamName,
        collegeName: team.collegeName,
        totalScore:
          (team.scores.round1 || 0) +
          (team.scores.round2 || 0) +
          (team.scores.round3?.challenge1 || 0) +
          (team.scores.round3?.challenge2 || 0),
        teamMembers: [team.memberOne, team.memberTwo].filter(Boolean),
      }))
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 10);

    if (io) {
      io.emit("leaderboardUpdate", leaderboardData);

      // Always broadcast current game state after leaderboard update
      await broadcastGameState();
    }

    return leaderboardData;
  } catch (error) {
    logger.error("Error updating leaderboard:", error);
    throw error;
  }
};

const initializeSocket = async (server) => {
  await initializeGameState();

  io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", async (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    try {
      // Send current game state on connection
      const currentState = await getCurrentGameState();
      socket.emit("gameStateUpdate", currentState);

      // Send leaderboard
      const leaderboardData = await updateLeaderboard();
      socket.emit("leaderboardUpdate", leaderboardData);
    } catch (error) {
      logger.error("Error sending initial state:", error);
    }

    socket.on("disconnect", () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const updateRegistrationStatus = async (status) => {
  try {
    const isOpen = typeof status === "string" ? status === "open" : status;

    const dbGameState = await GameState.findOne();
    if (dbGameState) {
      dbGameState.isRegistrationOpen = isOpen;
      await dbGameState.save();
    }

    if (io) {
      io.emit("registrationStatusChange", isOpen ? "open" : "closed");
      await broadcastGameState();
    }
  } catch (error) {
    logger.error("Error updating registration status:", error);
    throw error;
  }
};

const handleScoreUpdate = async (teamId) => {
  try {
    const team = await Team.findById(teamId).lean();
    if (!team) {
      logger.error(`Team not found: ${teamId}`);
      return;
    }

    const totalScore =
      (team.scores.round1 || 0) +
      (team.scores.round2 || 0) +
      (team.scores.round3?.challenge1 || 0) +
      (team.scores.round3?.challenge2 || 0);

    if (io) {
      // Emit individual score update
      io.emit("scoreUpdate", {
        teamName: team.teamName,
        totalScore,
        teamMembers: [team.memberOne, team.memberTwo].filter(Boolean),
        collegeName: team.collegeName,
      });

      // Update leaderboard
      await updateLeaderboard();
    }
  } catch (error) {
    logger.error("Error handling score update:", error);
  }
};

module.exports = {
  initializeSocket,
  getIO: () => io,
  updateGameState: async (newState) => {
    try {
      const dbGameState = await GameState.findOne();
      if (dbGameState) {
        Object.assign(dbGameState, newState);
        await dbGameState.save();
      }
      await broadcastGameState();
    } catch (error) {
      logger.error("Error updating game state:", error);
      throw error;
    }
  },
  updateRegistrationStatus,
  handleScoreUpdate,
  updateLeaderboard,
};
