// config/corsConfig.js
require("dotenv").config();

/**
 * Configure CORS options based on environment variables
 * @returns {Object} CORS configuration object
 */
const corsConfig = () => {
  // Parse comma-separated origins from environment variable
  const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",")
    : ["http://localhost:3000", "http://localhost:4000"];

  // Parse boolean from environment variable
  const credentials = process.env.CORS_CREDENTIALS === "true";

  return {
    origin: allowedOrigins,
    credentials: credentials,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  };
};

module.exports = corsConfig;
