const mongoose = require("mongoose");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/course");
const Lesson = require("../models/Lesson");

// ENROLL IN A COURSE
const enrollInCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        if (!mongoose.isValidObjectId(courseId)) {
            return res.status(400).json({
                message: "Invalid course ID"
            });
        }

        // Only published courses can be enrolled in
        const course = await Course.findOne({
            _id: courseId,
            isPublished: true
        });

        if (!course) {
            return res.status(404).json({
                message: "Course not found or not published"
            });
        }

        // Check whether the student is already enrolled
        const existingEnrollment = await Enrollment.findOne({
            student: req.user.id,
            course: courseId
        });

        if (existingEnrollment) {
            return res.status(200).json({
                message: "You are already enrolled in this course",
                enrollment: existingEnrollment
            });
        }

        const enrollment = await Enrollment.create({
            student: req.user.id,
            course: courseId
        });

        return res.status(201).json({
            message: "Successfully enrolled in the course",
            enrollment
        });
    } catch (error) {
        // Handle duplicate enrollment if two requests happen simultaneously
        if (error.code === 11000) {
            return res.status(409).json({
                message: "You are already enrolled in this course"
            });
        }

        console.error("Enrollment error:", error.message);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

// GET MY ENROLLED COURSES
const getMyEnrollments = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({
            student: req.user.id
        })
            .populate("course")
            .sort({ enrolledAt: -1 });

        return res.status(200).json({
            count: enrollments.length,
            enrollments
        });
    } catch (error) {
        console.error("Get enrollments error:", error.message);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

// MARK A LESSON AS COMPLETED
const completeLesson = async (req, res) => {
    try {
        const { courseId, lessonId } = req.params;

        if (
            !mongoose.isValidObjectId(courseId) ||
            !mongoose.isValidObjectId(lessonId)
        ) {
            return res.status(400).json({
                message: "Invalid course ID or lesson ID"
            });
        }

        // Verify the student is enrolled in this course
        const enrollment = await Enrollment.findOne({
            student: req.user.id,
            course: courseId
        });

        if (!enrollment) {
            return res.status(403).json({
                message: "You must enroll in this course first"
            });
        }

        // Verify that the lesson belongs to this course
        const lesson = await Lesson.findOne({
            _id: lessonId,
            course: courseId
        });

        if (!lesson) {
            return res.status(404).json({
                message: "Lesson not found in this course"
            });
        }

        // Avoid adding the same lesson more than once
        if (
            !enrollment.completedLessons.some(
                id => id.toString() === lessonId
            )
        ) {
            enrollment.completedLessons.push(lessonId);
            await enrollment.save();
        }

        return res.status(200).json({
            message: "Lesson marked as completed",
            completedLessons: enrollment.completedLessons
        });
    } catch (error) {
        console.error("Complete lesson error:", error.message);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    enrollInCourse,
    getMyEnrollments,
    completeLesson
};