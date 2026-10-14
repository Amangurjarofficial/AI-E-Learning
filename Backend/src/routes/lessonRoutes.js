const express = require("express");

const {
    createLesson,
    getLessons,
    updateLesson,
    deleteLesson
} = require("../controllers/lessonController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router({ mergeParams: true });

// Published courses can be viewed publicly.
// An instructor can also view lessons in their own unpublished course.
router.get("/", getLessons);

// Instructor-only lesson management
router.post(
    "/",
    protect,
    authorizeRoles("instructor"),
    createLesson
);

router.put(
    "/:lessonId",
    protect,
    authorizeRoles("instructor"),
    updateLesson
);

router.delete(
    "/:lessonId",
    protect,
    authorizeRoles("instructor"),
    deleteLesson
);

module.exports = router;