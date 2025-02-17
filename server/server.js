require("dotenv").config();
const app = require("./app");
const http = require("http");
const connectDB = require("./config/Database");
const { initializeSocket } = require("./config/socket");

const server = http.createServer(app);
const io = initializeSocket(server);

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server is listening on port http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
    process.exit(1);
  });

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  process.exit(1);
});
