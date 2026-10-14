
const express = require("express");
const { askAITutor } = require("../controllers/aiTutorController");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
    "/:courseId/ask",
    protect,
    authorizeRoles("student"),
    askAITutor
);

router.post(
    "/:courseId/lessons/:lessonId/ask",
    protect,
    authorizeRoles("student"),
    askAITutor
);

module.exports = router;
