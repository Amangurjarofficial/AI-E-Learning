const express = require("express");

const {
    enrollInCourse,
    getMyEnrollments,
    completeLesson
} = require("../controllers/enrollmentController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
    "/:courseId",
    protect,
    authorizeRoles("student"),
    enrollInCourse
);

router.get(
    "/my-courses",
    protect,
    authorizeRoles("student"),
    getMyEnrollments
);

router.patch(
    "/:courseId/lessons/:lessonId/complete",
    protect,
    authorizeRoles("student"),
    completeLesson
);

module.exports = router;