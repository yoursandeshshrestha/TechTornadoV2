const Admin = require("../models/Admin");
const Team = require("../models/Team");
const GameState = require("../models/gameState");
const { getIO } = require("../config/socket");
const { getRoundDuration } = require("../utils/helpers");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");
const Question = require("../models/Question");

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

    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
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

    let refreshToken;
    try {
      refreshToken = jwt.sign(
        { adminId: admin._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
      );

      await Admin.updateOne(
        { _id: admin._id },
        { $set: { refreshToken: await bcrypt.hash(refreshToken, 10) } }
      );
    } catch (refreshError) {
      console.error("Error generating refresh token:", refreshError);
    }

    return {
      success: true,
      message: "Login successful",
      data: {
        token,
        refreshToken,
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
  const duration = getRoundDuration(round);
  const endTime = new Date(Date.now() + duration);

  await GameState.updateOne(
    {},
    {
      currentRound: round,
      roundStartTime: new Date(),
      roundEndTime: endTime,
    }
  );

  getIO().emit("roundStart", { round, endTime });

  // Schedule round end
  setTimeout(async () => {
    await endRound(round);
  }, duration);

  return { message: `Round ${round} started`, endTime };
};

const endRound = async (round) => {
  await GameState.updateOne(
    {},
    {
      currentRound: round < 3 ? round + 1 : 3,
      roundStartTime: null,
      roundEndTime: null,
    }
  );

  getIO().emit("roundEnd", { round });
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
    const requiredFields = [
      "round",
      "questionNumber",
      "content",
      "answer",
      "points",
    ];
    const missingFields = requiredFields.filter(
      (field) => !questionData[field]
    );

    if (missingFields.length > 0) {
      return {
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      };
    }

    // Check if question already exists in the specified round
    const existingQuestion = await Question.findOne({
      round: questionData.round,
      questionNumber: questionData.questionNumber,
    });

    if (existingQuestion) {
      return {
        success: false,
        message: `Question ${questionData.questionNumber} already exists in round ${questionData.round}`,
      };
    }

    const question = new Question(questionData);
    await question.save();

    return {
      success: true,
      message: "Question created successfully",
      data: question,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to create question",
      error: error.message,
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

const updateQuestion = async (questionId, updateData) => {
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
};
