const { registerTeam } = require("../services/teamService");

const register = async (req, res) => {
  try {
    const token = await registerTeam(req.body);
    res.status(201).json({
      success: true,
      token,
      message: "Team registered successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { register };
