const { registerTeam, loginTeam } = require("../services/teamService");

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

const login = async (req, res) => {
  try {
    const { teamName, password } = req.body;
    const loginResult = await loginTeam(teamName, password);

    res.status(200).json({
      success: true,
      ...loginResult,
      message: "Login successful",
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { register, login };
