const express = require("express");
const cors = require("cors");
const logger = require("./utils/logger");
const notFoundHandler = require("./utils/notFoundHandler");

const app = express();

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

app.get("/", (req, res) => {
  res.send("Api is working");
});

app.use(notFoundHandler);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

module.exports = app;
