const express = require("express");

const {
    createCourse,
    getCourses,
    getMyCourses,
    getCourseById,
    publishCourse,
    updateCourse,
    deleteCourse
} = require("../controllers/courseController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Public: view published courses
router.get("/", getCourses);

// Instructor: view courses they created
router.get(
    "/my-courses",
    protect,
    authorizeRoles("instructor"),
    getMyCourses
);

// Public: view a published course by ID
router.get("/:id", getCourseById);

// Instructor: create a course
router.post(
    "/",
    protect,
    authorizeRoles("instructor"),
    createCourse
);

// Instructor: publish a course they own
router.patch(
    "/:id/publish",
    protect,
    authorizeRoles("instructor"),
    publishCourse
);

// Instructor: edit a course they own
router.put(
    "/:id",
    protect,
    authorizeRoles("instructor"),
    updateCourse
);

// Instructor: delete a course they own
router.delete(
    "/:id",
    protect,
    authorizeRoles("instructor"),
    deleteCourse
);

module.exports = router;