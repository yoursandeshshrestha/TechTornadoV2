const logger = require("./logger");

module.exports = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.status = 404;

  // Log the error
  logger.warn(`${req.method} ${req.originalUrl} - Route not found`);

  // Send detailed error in development, generic message in production
  const response = {
    message:
      process.env.NODE_ENV === "development"
        ? error.message
        : "The requested resource was not found.",
    ...(process.env.NODE_ENV === "development" && {
      method: req.method,
      path: req.originalUrl,
    }),
  };

  res.status(404).json(response);
};
