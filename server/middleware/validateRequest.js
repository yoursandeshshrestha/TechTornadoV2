const { validationResult, check } = require("express-validator");

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
};

const registerValidation = [
  check("teamName")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Team name is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("Team name must be between 3 and 50 characters"),

  check("collegeName")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("College name is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("College name must be between 3 and 100 characters"),

  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/\d/)
    .withMessage("Password must contain at least one number"),

  check("memberOne")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Member One is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Member name must be between 2 and 50 characters"),

  check("memberTwo")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Member name must be between 2 and 50 characters"),
];

const loginValidation = [
  check("teamName").trim().notEmpty().withMessage("Team name is required"),
  check("password").trim().notEmpty().withMessage("Password is required"),
];

module.exports = {
  validateRequest,
  registerValidation,
  loginValidation,
};
