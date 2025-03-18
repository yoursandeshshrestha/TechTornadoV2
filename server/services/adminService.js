const Admin = require("../models/Admin");
const Team = require("../models/Team");
const GameState = require("../models/gameState");
const { getIO, updateLeaderboard } = require("../config/socket");
const { getRoundDuration, calculatePoints } = require("../utils/helpers");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Question = require("../models/Question");
const path = require("path");
const fs = require("fs");
const logger = require("../utils/logger");

const registerAdmin = async (username, password) => {
  try {
    if (!username || !password) {
      throw new Error("Username and password are required");
    }

    if (!/^[a-zA-Z0-9]{4,}$/.test(username)) {
      throw new Error(
        "Username must be at least 4 characters long and contain only letters and numbers"
      );
    }

    if (password.length < 4) {
      throw new Error("Password must be at least 4 characters long");
    }

    const existingAdmin = await Admin.findOne({
      username: username.toLowerCase(),
    });
    if (existingAdmin) {
      throw new Error("An admin with this username already exists");
    }

    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
    } catch (hashError) {
      throw new Error("Error processing password. Please try again");
    }

    const admin = new Admin({
      username: username.toLowerCase().trim(),
      password: hashedPassword,
      createdAt: new Date(),
    });

    try {
      await admin.save();
    } catch (saveError) {
      if (saveError.code === 11000) {
        throw new Error("Username already taken");
      }
      throw new Error("Error creating admin account");
    }

    let token;
    try {
      token = jwt.sign(
        {
          adminId: admin._id,
          username: admin.username,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );
    } catch (tokenError) {
      await Admin.findByIdAndDelete(admin._id);
      throw new Error("Error generating authentication token");
    }

    return {
      success: true,
      message: "Admin registered successfully",
      data: {
        token,
        username: admin.username,
        id: admin._id,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Registration failed",
      error: {
        code: error.code || "REGISTRATION_ERROR",
        details: error.message,
      },
    };
  }
};

const loginAdmin = async (username, password) => {
  try {
    if (!username || !password) {
      throw new Error("Username and password are required");
    }

    const normalizedUsername = username.toLowerCase().trim();

    let admin;
    try {
      admin = await Admin.findOne({ username: normalizedUsername })
        .select("+password")
        .lean();
    } catch (dbError) {
      throw new Error("Database error occurred while finding admin");
    }

    if (!admin) {
      throw new Error("Invalid credentials");
    }

    if (admin.loginAttempts >= 5 && admin.lockUntil > Date.now()) {
      throw new Error("Account is temporarily locked. Please try again later");
    }

    let validPassword;
    try {
      validPassword = await bcrypt.compare(password, admin.password);
    } catch (bcryptError) {
      throw new Error("Error verifying credentials");
    }

    if (!validPassword) {
      try {
        await Admin.updateOne(
          { _id: admin._id },
          {
            $inc: { loginAttempts: 1 },
            $set: {
              lockUntil:
                admin.loginAttempts + 1 >= 5
                  ? Date.now() + 15 * 60 * 1000 // Lock for 15 minutes
                  : undefined,
            },
          }
        );
      } catch (updateError) {
        console.error("Error updating login attempts:", updateError);
      }

      throw new Error("Invalid credentials");
    }

    try {
      await Admin.updateOne(
        { _id: admin._id },
        {
          $set: {
            loginAttempts: 0,
            lockUntil: null,
            lastLoginAt: new Date(),
          },
        }
      );
    } catch (resetError) {
      console.error("Error resetting login attempts:", resetError);
    }

    let token;
    try {
      token = jwt.sign(
        {
          adminId: admin._id,
          username: admin.username,
          role: admin.role || "admin",
          iat: Math.floor(Date.now() / 1000),
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "24h",
          algorithm: "HS256",
        }
      );
    } catch (tokenError) {
      throw new Error("Error generating authentication token");
    }

    return {
      success: true,
      message: "Login successful",
      data: {
        token,
        admin: {
          id: admin._id,
          username: admin.username,
          role: admin.role,
          lastLogin: admin.lastLoginAt,
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Login failed",
      error: {
        code: error.code || "AUTH_ERROR",
        details:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Authentication failed",
      },
    };
  }
};

const startRound = async (round) => {
  try {
    const duration = getRoundDuration(round);
    const endTime = new Date(Date.now() + duration);

    const gameState = await GameState.findOneAndUpdate(
      {},
      {
        currentRound: round,
        isGameActive: true,
        roundStartTime: new Date(),
        roundEndTime: endTime,
        isPaused: false,
      },
      { upsert: true, new: true }
    );

    // Emit both game state update and round change events
    const io = getIO();
    io.emit("gameStateUpdate", {
      currentRound: round,
      gameStatus: "In Progress",
      endTime: endTime.toISOString(), // Format endTime as ISO string
    });

    io.emit("roundChange", {
      round,
      endTime: endTime.toISOString(),
    });

    // Schedule round end
    setTimeout(async () => {
      await endRound(round);
    }, duration);

    return {
      message: `Round ${round} started`,
      data: {
        endTime: endTime.toISOString(),
      },
    };
  } catch (error) {
    console.error("Start round error:", error);
    throw new Error("Failed to start round: " + error.message);
  }
};

const endRound = async () => {
  try {
    await GameState.updateOne(
      {},
      {
        currentRound: 0,
        isGameActive: false,
        roundStartTime: null,
        roundEndTime: null,
        isPaused: false,
      }
    );

    const io = getIO();
    io.emit("gameStateUpdate", {
      currentRound: 0,
      gameStatus: "Stopped",
      endTime: null,
    });

    io.emit("roundTerminated", { currentRound: 0 });

    // Update leaderboard after round end
    try {
      const leaderboardData = await updateLeaderboard();
      io.emit("leaderboardUpdate", leaderboardData);
    } catch (error) {
      logger.error("Error updating leaderboard after round end:", error);
    }
  } catch (error) {
    logger.error("Error ending round:", error);
    throw new Error("Failed to end round: " + error.message);
  }
};

const getScores = async () => {
  try {
    const teams = await Team.find({}, "teamName scores currentRound");

    if (!teams || teams.length === 0) {
      return {
        success: false,
        message: "No teams found in the database",
        data: null,
      };
    }

    return {
      success: true,
      message: "Teams retrieved successfully",
      data: teams,
    };
  } catch (error) {
    return {
      success: false,
      message: "Error retrieving teams: " + error.message,
      data: null,
    };
  }
};

const createQuestion = async (questionData) => {
  try {
    // Validate required fields
    const requiredFields = ["round", "questionNumber", "content", "answer"];
    const missingFields = requiredFields.filter(
      (field) => !questionData[field]
    );

    if (missingFields.length > 0) {
      return {
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      };
    }

    // Validate round number
    if (![1, 2, 3].includes(Number(questionData.round))) {
      return {
        success: false,
        message: "Round must be 1, 2, or 3",
      };
    }

    // Validate question number
    if (Number(questionData.questionNumber) < 1) {
      return {
        success: false,
        message: "Question number must be a positive number",
      };
    }

    // Check if question already exists
    const existingQuestion = await Question.findOne({
      round: questionData.round,
      questionNumber: questionData.questionNumber,
    });

    if (existingQuestion) {
      return {
        success: false,
        message: `Question ${questionData.questionNumber} already exists in round ${questionData.round}`,
        code: "DUPLICATE_QUESTION",
      };
    }

    // Create the question object
    const newQuestionData = {
      round: Number(questionData.round),
      questionNumber: Number(questionData.questionNumber),
      content: questionData.content,
      answer: questionData.answer,
      points: calculatePoints(Number(questionData.round)),
    };

    // Add hints if provided
    if (questionData.hints) {
      // Process hints based on what we receive
      if (Array.isArray(questionData.hints)) {
        // Filter out any empty hints
        newQuestionData.hints = questionData.hints.filter(
          (hint) => hint && typeof hint === "string" && hint.trim() !== ""
        );
      } else if (typeof questionData.hints === "string") {
        try {
          // Try to parse as JSON if it's a string that looks like JSON
          if (questionData.hints.startsWith("[")) {
            const parsedHints = JSON.parse(questionData.hints);
            newQuestionData.hints = Array.isArray(parsedHints)
              ? parsedHints.filter((hint) => hint && hint.trim() !== "")
              : [questionData.hints];
          } else {
            // It's a single hint as a string
            newQuestionData.hints = [questionData.hints];
          }
        } catch (e) {
          // If parsing fails, treat as a single hint
          newQuestionData.hints = [questionData.hints];
        }
      }
    }

    // Create and save the question
    const question = new Question(newQuestionData);
    await question.save();

    return {
      success: true,
      message: "Question created successfully",
      data: question,
    };
  } catch (error) {
    // Handle specific error cases
    if (error.message.includes("already exists in round")) {
      return {
        success: false,
        message: error.message,
        code: "DUPLICATE_QUESTION",
      };
    }

    // Handle mongoose validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return {
        success: false,
        message: "Validation failed",
        errors: validationErrors,
        code: "VALIDATION_ERROR",
      };
    }

    return {
      success: false,
      message: "Failed to create question",
      error: error.message,
      code: "INTERNAL_ERROR",
    };
  }
};

const getAllQuestions = async () => {
  try {
    const questions = await Question.find().sort({
      round: 1,
      questionNumber: 1,
    });

    if (!questions || questions.length === 0) {
      return {
        success: false,
        message: "No questions found",
      };
    }

    return {
      success: true,
      data: questions,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch questions",
    };
  }
};

const getQuestionsByRound = async (round) => {
  try {
    // Validate round parameter
    if (!round || isNaN(round)) {
      return {
        success: false,
        message: "Please provide a valid round number",
      };
    }

    const questions = await Question.find({ round }).sort({
      questionNumber: 1,
    });

    if (!questions || questions.length === 0) {
      return {
        success: false,
        message: `No questions found for round ${round}`,
      };
    }

    return {
      success: true,
      data: questions,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch questions",
    };
  }
};

const updateQuestion = async (questionId, updateData, files) => {
  try {
    // Validate question ID
    if (!questionId) {
      return {
        success: false,
        message: "Question ID is required",
      };
    }

    // Check if question exists before update
    const existingQuestion = await Question.findById(questionId);
    if (!existingQuestion) {
      return {
        success: false,
        message: "Question not found",
      };
    }

    // If changing round/number, check for duplicates
    if (updateData.round && updateData.questionNumber) {
      const duplicateQuestion = await Question.findOne({
        round: updateData.round,
        questionNumber: updateData.questionNumber,
        _id: { $ne: questionId },
      });

      if (duplicateQuestion) {
        return {
          success: false,
          message: `Question ${updateData.questionNumber} already exists in round ${updateData.round}`,
        };
      }
    }

    // Handle file uploads
    if (files) {
      // Initialize media object if it doesn't exist
      if (!existingQuestion.media) {
        existingQuestion.media = {};
        updateData.media = {};
      } else {
        // Copy existing media to update data so we don't lose it
        updateData.media = existingQuestion.media;
      }

      // Handle image upload
      if (files.image) {
        const uploadDir = path.join(__dirname, "../uploads/images");

        // Ensure directory exists
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Create a unique filename
        const fileName = `${Date.now()}-${files.image.name}`;
        const filePath = path.join(uploadDir, fileName);

        // Move file to upload directory
        await files.image.mv(filePath);

        // Delete old image if it exists
        if (existingQuestion.media.image && existingQuestion.media.image.url) {
          try {
            const oldImagePath = path.join(
              __dirname,
              "..",
              existingQuestion.media.image.url
            );
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
            }
          } catch (err) {
            console.error("Error deleting old image:", err);
          }
        }

        // Update image data
        updateData.media.image = {
          url: `/uploads/images/${fileName}`,
          fileName: files.image.name,
        };
      }

      // Handle PDF upload
      if (files.pdf) {
        const uploadDir = path.join(__dirname, "../uploads/pdfs");

        // Ensure directory exists
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Create a unique filename
        const fileName = `${Date.now()}-${files.pdf.name}`;
        const filePath = path.join(uploadDir, fileName);

        // Move file to upload directory
        await files.pdf.mv(filePath);

        // Delete old PDF if it exists
        if (existingQuestion.media.pdf && existingQuestion.media.pdf.url) {
          try {
            const oldPdfPath = path.join(
              __dirname,
              "..",
              existingQuestion.media.pdf.url
            );
            if (fs.existsSync(oldPdfPath)) {
              fs.unlinkSync(oldPdfPath);
            }
          } catch (err) {
            console.error("Error deleting old PDF:", err);
          }
        }

        // Update PDF data
        updateData.media.pdf = {
          url: `/uploads/pdfs/${fileName}`,
          fileName: files.pdf.name,
        };
      }
    }

    const updatedQuestion = await Question.findByIdAndUpdate(
      questionId,
      updateData,
      { new: true, runValidators: true }
    );

    return {
      success: true,
      message: "Question updated successfully",
      data: updatedQuestion,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to update question",
      error: error.message,
    };
  }
};

const deleteQuestion = async (questionId) => {
  try {
    // Validate question ID
    if (!questionId) {
      return {
        success: false,
        message: "Question ID is required",
      };
    }

    const question = await Question.findByIdAndDelete(questionId);

    if (!question) {
      return {
        success: false,
        message: "Question not found",
      };
    }

    return {
      success: true,
      message: "Question deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to delete question",
    };
  }
};

const openRegistration = async () => {
  // Check if GameState exists, if not create one
  let gameState = await GameState.findOne();
  if (!gameState) {
    gameState = new GameState({
      isRegistrationOpen: true,
      currentRound: 0,
    });
  } else {
    gameState.isRegistrationOpen = true;
  }

  await gameState.save();
  return { message: "Registration opened successfully" };
};

const closeRegistration = async () => {
  await GameState.updateOne(
    {},
    { isRegistrationOpen: false },
    { upsert: true }
  );
  return { message: "Registration closed successfully" };
};

const getRegistrationStatus = async () => {
  const gameState = await GameState.findOne();
  return {
    isRegistrationOpen: gameState ? gameState.isRegistrationOpen : false,
  };
};

const createBulkQuestions = async (questions) => {
  try {
    // Group questions by round for duplicate checking
    const questionsByRound = {};
    questions.forEach((q) => {
      if (!questionsByRound[q.round]) {
        questionsByRound[q.round] = new Set();
      }
      questionsByRound[q.round].add(q.questionNumber);
    });

    // Check for duplicate question numbers within rounds
    for (const round in questionsByRound) {
      const existingQuestions = await Question.find({
        round: parseInt(round),
      }).select("questionNumber");

      for (const existing of existingQuestions) {
        if (questionsByRound[round].has(existing.questionNumber)) {
          throw new Error(
            `Question ${existing.questionNumber} already exists in round ${round}`
          );
        }
      }
    }

    // Create questions without transaction
    const createdQuestions = await Question.insertMany(questions);

    return {
      success: true,
      message: `Successfully created ${createdQuestions.length} questions`,
      data: createdQuestions,
    };
  } catch (error) {
    if (error.code === 11000) {
      return {
        success: false,
        message: "Duplicate question numbers detected within a round",
        error: error.message,
      };
    }

    return {
      success: false,
      message: "Failed to create questions",
      error: error.message,
    };
  }
};

const terminateRound = async () => {
  try {
    // Update database first
    const updatedState = await GameState.findOneAndUpdate(
      {},
      {
        isGameActive: false,
        currentRound: 0,
        roundStartTime: null,
        roundEndTime: null,
        remainingTime: null,
        isPaused: false,
      },
      { new: true }
    );

    if (!updatedState) {
      throw new Error("Failed to update game state");
    }

    // Get socket instance
    const io = getIO();

    // Emit game state update first
    io.emit("gameStateUpdate", {
      currentRound: 0,
      gameStatus: "Stopped",
      isGameActive: false,
      endTime: null,
    });

    // Then emit round terminated event
    io.emit("roundTerminated", {
      message: "Round terminated",
      currentRound: 0,
      isGameActive: false,
    });

    return {
      success: true,
      message: "Round terminated successfully",
    };
  } catch (error) {
    console.error("Error in terminateRound:", error);
    throw new Error("Failed to terminate round: " + error.message);
  }
};

const getTeams = async () => {
  try {
    const teams = await Team.find({}).sort({ createdAt: -1 });

    if (!teams || teams.length === 0) {
      return {
        success: false,
        message: "No teams found in the database",
        data: null,
      };
    }

    return {
      success: true,
      message: "Teams retrieved successfully",
      data: teams,
    };
  } catch (error) {
    logger.error("Error retrieving teams:", error);
    return {
      success: false,
      message: "Error retrieving teams: " + error.message,
      data: null,
    };
  }
};

const getTeamById = async (teamId) => {
  try {
    // Validate teamId
    if (!teamId) {
      return {
        success: false,
        message: "Team ID is required",
        code: "MISSING_ID",
      };
    }

    const team = await Team.findById(teamId);

    if (!team) {
      return {
        success: false,
        message: "Team not found",
        code: "NOT_FOUND",
      };
    }

    return {
      success: true,
      message: "Team retrieved successfully",
      data: team,
    };
  } catch (error) {
    // Handle case when ID format is invalid
    if (error.name === "CastError") {
      return {
        success: false,
        message: "Invalid team ID format",
        code: "INVALID_ID",
      };
    }

    logger.error("Error retrieving team by ID:", error);
    return {
      success: false,
      message: "Failed to retrieve team",
      error: error.message,
      code: "INTERNAL_ERROR",
    };
  }
};

const deleteTeam = async (teamId) => {
  try {
    // Validate teamId
    if (!teamId) {
      return {
        success: false,
        message: "Team ID is required",
        code: "MISSING_ID",
      };
    }

    const team = await Team.findById(teamId);

    if (!team) {
      return {
        success: false,
        message: "Team not found",
        code: "NOT_FOUND",
      };
    }

    // Delete the team
    await Team.findByIdAndDelete(teamId);

    // Optionally, update leaderboard after team deletion
    try {
      const io = getIO();
      const leaderboardData = await updateLeaderboard();
      io.emit("leaderboardUpdate", leaderboardData);
    } catch (leaderboardError) {
      logger.error(
        "Error updating leaderboard after team deletion:",
        leaderboardError
      );
      // Continue with response even if leaderboard update fails
    }

    return {
      success: true,
      message: "Team deleted successfully",
    };
  } catch (error) {
    // Handle case when ID format is invalid
    if (error.name === "CastError") {
      return {
        success: false,
        message: "Invalid team ID format",
        code: "INVALID_ID",
      };
    }

    logger.error("Error deleting team:", error);
    return {
      success: false,
      message: "Failed to delete team",
      error: error.message,
      code: "INTERNAL_ERROR",
    };
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  startRound,
  endRound,
  getScores,
  createQuestion,
  getAllQuestions,
  getQuestionsByRound,
  updateQuestion,
  deleteQuestion,
  openRegistration,
  closeRegistration,
  getRegistrationStatus,
  createBulkQuestions,
  terminateRound,
  getTeams,
  getTeamById,
  deleteTeam,
};
