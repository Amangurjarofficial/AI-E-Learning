
const express = require("express");

const {
    generateQuiz,
    getQuizzesForCourse,
    getQuiz,
    submitQuiz
} = require("../controllers/quizController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Instructor generates a quiz for a lesson
router.post(
    "/courses/:courseId/lessons/:lessonId/generate",
    protect,
    authorizeRoles("instructor"),
    generateQuiz
);

// Keep the original generation URL available for existing clients
router.post(
    "/courses/:courseId/lessons/:lessonId",
    protect,
    authorizeRoles("instructor"),
    generateQuiz
);

// Enrolled student lists the quizzes belonging to a course
router.get(
    "/courses/:courseId",
    protect,
    authorizeRoles("student"),
    getQuizzesForCourse
);

// Enrolled student retrieves quiz questions
router.get(
    "/:quizId",
    protect,
    authorizeRoles("student"),
    getQuiz
);

// Enrolled student submits answers
router.post(
    "/:quizId/submit",
    protect,
    authorizeRoles("student"),
    submitQuiz
);

module.exports = router;
