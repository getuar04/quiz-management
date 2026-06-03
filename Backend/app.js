require("dotenv").config();
const express = require("express");
const connectDB = require("./src/config/db");

const authRoutes = require("./src/routes/auth.routes");
const userRoutes = require("./src/routes/user.routes");
const quizRoutes = require("./src/routes/quiz.routes");
const questionRoutes = require("./src/routes/question.routes");

const errorHandler = require("./src/middleware/error.middleware");
const notFound = require("./src/middleware/notFound.middleware");

const app = express();

connectDB();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.CLIENT_URL || "http://localhost:5173");
  res.header("Access-Control-Allow-Methods", "GET,POST,PATCH,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/questions", questionRoutes);

const healthCheck = (req, res) => {
  res.json({ message: "Quiz Management API is running 🚀" });
};

app.get("/", healthCheck);
app.get("/api", healthCheck);
app.get("/api/health", healthCheck);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port http://localhost:${PORT}`);
});
