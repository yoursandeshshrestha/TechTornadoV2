const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const path = require("path");
const logger = require("./utils/logger");
const notFoundHandler = require("./utils/notFoundHandler");
const adminRoutes = require("./routes/adminRoutes");
const teamRoutes = require("./routes/teamRoutes");
const gameRoutes = require("./routes/gameRoutes");
const corsConfig = require("./config/corsConfig");

// Load environment variables
require("dotenv").config();

const app = express();

// Apply CORS configuration from environment
app.use(cors(corsConfig()));

app.use(express.json());

// File upload middleware with configuration from environment
app.use(
  fileUpload({
    limits: {
      fileSize: parseInt(process.env.FILE_UPLOAD_LIMIT || 10 * 1024 * 1024),
    },
    createParentPath: true,
    useTempFiles: true,
    tempFileDir: process.env.FILE_UPLOAD_TEMP_DIR || "/tmp/",
    abortOnLimit: true,
  })
);

// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Test Route
app.get("/", (req, res) => {
  res.send("Api is working");
});

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/game", gameRoutes);

// Error handling middleware
app.use(notFoundHandler);
app.use((err, req, res, next) => {
  logger.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

module.exports = app;
