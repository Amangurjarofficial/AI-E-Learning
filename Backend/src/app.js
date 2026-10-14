
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const protect = require("./middleware/authMiddleware");
const authorizeRoles = require("./middleware/roleMiddleware");
const courseRoutes = require("./routes/courseRoutes");
const lessonRoutes = require("./routes/lessonRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const aiTutorRoutes = require("./routes/aiTutorRoutes");
const quizRoutes = require("./routes/quizRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.status(200).send("AI E-Learning Backend is running");
});

// Protected profile route
app.get("/api/auth/profile", protect, (req, res) => {
  res.status(200).json({
    message: "You accessed a protected route",
    user: req.user,
  });
});

// Protected instructor dashboard route
app.get(
  "/api/auth/instructor-dashboard",
  protect,
  authorizeRoles("instructor"),
  (req, res) => {
    res.status(200).json({
      message: "Welcome to the instructor dashboard",
      user: req.user,
    });
  }
);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);

// Nested lesson routes
app.use("/api/courses/:courseId/lessons", lessonRoutes);

app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/ai-tutor", aiTutorRoutes);
app.use("/api/quizzes", quizRoutes);

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

module.exports = app;
