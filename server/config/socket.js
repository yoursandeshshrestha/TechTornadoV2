const socketIo = require("socket.io");
const logger = require("../utils/logger");
const Team = require("../models/Team");
const { updateLeaderboard } = require("../services/gameService");
const GameState = require("../models/gameState");

let io;
let gameState = {
  gameStatus: "Stopped",
  isRegistrationOpen: false,
  currentRound: 0,
  activeUsers: 0,
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
        activeUsers: 0, // This will be updated when leaderboard is fetched
      };
    }
    logger.info("Game state initialized:", gameState);
  } catch (error) {
    logger.error("Error initializing game state:", error);
  }
};

const initializeSocket = async (server) => {
  // Initialize state before setting up socket
  await initializeGameState();

  io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  io.on("connection", async (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    // Send initial state to newly connected client
    socket.emit("gameStateUpdate", gameState);

    // Send initial leaderboard data
    try {
      const leaderboardData = await updateLeaderboard();
      socket.emit("leaderboardUpdate", leaderboardData);

      // Update active users count
      gameState.activeUsers = leaderboardData.length;
      socket.emit("gameStateUpdate", gameState);
    } catch (error) {
      logger.error("Error sending initial leaderboard:", error);
    }

    // Handle initial state request
    socket.on("requestInitialState", async () => {
      socket.emit("gameStateUpdate", gameState);
      logger.info("Initial state sent to client:", gameState);

      try {
        const leaderboardData = await updateLeaderboard();
        socket.emit("leaderboardUpdate", leaderboardData);
      } catch (error) {
        logger.error("Error sending requested leaderboard:", error);
      }
    });

    // Handle round change
    socket.on("roundChange", async (round) => {
      try {
        // Update database
        const dbGameState = await GameState.findOne();
        if (dbGameState) {
          dbGameState.currentRound = round;
          await dbGameState.save();
        }

        // Update socket state
        gameState.currentRound = round;
        gameState.gameStatus = round === 0 ? "Stopped" : "In Progress";

        // Broadcast to all clients
        io.emit("gameStateUpdate", gameState);
        logger.info(
          `Round changed to: ${round}, Game status: ${gameState.gameStatus}`
        );

        // Update leaderboard
        const leaderboardData = await updateLeaderboard();
        io.emit("leaderboardUpdate", leaderboardData);
      } catch (error) {
        logger.error("Error handling round change:", error);
      }
    });

    socket.on("disconnect", () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

const updateGameState = async (newState) => {
  try {
    // Update database first
    const dbGameState = await GameState.findOne();
    if (dbGameState) {
      if (newState.currentRound !== undefined)
        dbGameState.currentRound = newState.currentRound;
      if (newState.isRegistrationOpen !== undefined)
        dbGameState.isRegistrationOpen = newState.isRegistrationOpen;
      await dbGameState.save();
    }

    // Update socket state
    gameState = { ...gameState, ...newState };

    // Broadcast update if socket is initialized
    if (io) {
      io.emit("gameStateUpdate", gameState);
      logger.info("Game state updated:", gameState);

      // Update leaderboard
      const leaderboardData = await updateLeaderboard();
      io.emit("leaderboardUpdate", leaderboardData);
    }
  } catch (error) {
    logger.error("Error updating game state:", error);
    throw error;
  }
};

const updateRegistrationStatus = async (status) => {
  try {
    // Convert string status to boolean if necessary
    const isOpen = typeof status === "string" ? status === "open" : status;

    // Update database
    const dbGameState = await GameState.findOne();
    if (dbGameState) {
      dbGameState.isRegistrationOpen = isOpen;
      await dbGameState.save();
    }

    // Update socket state
    gameState.isRegistrationOpen = isOpen;

    // Broadcast update
    if (io) {
      // First emit the specific registration status change event
      io.emit("registrationStatusChange", isOpen ? "open" : "closed");

      // Then emit the complete game state update
      io.emit("gameStateUpdate", {
        gameStatus: gameState.gameStatus,
        isRegistrationOpen: isOpen,
        currentRound: gameState.currentRound,
        activeUsers: gameState.activeUsers,
      });

      logger.info("Registration status updated:", isOpen);

      // Update leaderboard
      const leaderboardData = await updateLeaderboard();
      io.emit("leaderboardUpdate", leaderboardData);
    }
  } catch (error) {
    logger.error("Error updating registration status:", error);
    throw error;
  }
};

const updateRound = async (round) => {
  try {
    // Update database
    const dbGameState = await GameState.findOne();
    if (dbGameState) {
      dbGameState.currentRound = round;
      await dbGameState.save();
    }

    // Update socket state
    gameState.currentRound = round;
    gameState.gameStatus = round === 0 ? "Stopped" : "In Progress";

    // Broadcast update
    if (io) {
      io.emit("gameStateUpdate", gameState);
      logger.info("Round updated:", round);

      // Update leaderboard
      const leaderboardData = await updateLeaderboard();
      io.emit("leaderboardUpdate", leaderboardData);
    }
  } catch (error) {
    logger.error("Error updating round:", error);
    throw error;
  }
};

const updateActiveUsers = async (count) => {
  gameState.activeUsers = count;
  if (io) {
    io.emit("gameStateUpdate", gameState);
    logger.info("Active users updated:", count);
  }
};

const broadcastLeaderboard = async () => {
  try {
    const leaderboardData = await updateLeaderboard();
    if (io) {
      io.emit("leaderboardUpdate", leaderboardData);

      // Update active users count in game state
      gameState.activeUsers = leaderboardData.length;
      io.emit("gameStateUpdate", gameState);
    }
    return leaderboardData;
  } catch (error) {
    logger.error("Error broadcasting leaderboard:", error);
    throw error;
  }
};

const terminateRound = async () => {
  try {
    // Update database
    const dbGameState = await GameState.findOne();
    if (dbGameState) {
      dbGameState.currentRound = 0; // Reset round to 0 when terminated
      await dbGameState.save();
    }

    // Update socket state
    gameState.currentRound = 0;
    gameState.gameStatus = "Stopped";

    // Broadcast updates
    if (io) {
      // Emit specific round termination event
      io.emit("roundTerminated", { currentRound: 0 });

      // Emit general game state update
      io.emit("gameStateUpdate", gameState);
      logger.info("Round terminated");

      // Update leaderboard
      const leaderboardData = await updateLeaderboard();
      io.emit("leaderboardUpdate", leaderboardData);
    }
  } catch (error) {
    logger.error("Error terminating round:", error);
    throw error;
  }
};

const updateScore = async (teamId) => {
  try {
    // Get updated team data
    const team = await Team.findById(teamId, {
      teamName: 1,
      scores: 1,
      memberOne: 1,
      memberTwo: 1,
      collegeName: 1,
    });

    if (!team) {
      logger.error(`Team not found with id: ${teamId}`);
      return;
    }

    // Calculate total score
    const totalScore =
      team.scores.round1 +
      team.scores.round2 +
      team.scores.round3.challenge1 +
      team.scores.round3.challenge2;

    // Emit immediate score update for this team
    if (io) {
      io.emit("scoreUpdate", {
        teamName: team.teamName,
        collegeName: team.collegeName,
        totalScore: totalScore,
        teamMembers: [team.memberOne, team.memberTwo].filter(Boolean),
      });

      // Also send full leaderboard update
      const leaderboardData = await updateLeaderboard();
      io.emit("leaderboardUpdate", leaderboardData);
    }
  } catch (error) {
    logger.error("Error in updateScore:", error);
    throw error;
  }
};

module.exports = {
  initializeSocket,
  getIO,
  updateGameState,
  updateRegistrationStatus,
  updateRound,
  updateActiveUsers,
  broadcastLeaderboard,
  terminateRound,
  updateScore,
};
