const mongoose = require("mongoose");
const Lesson = require("../models/Lesson");
const Course = require("../models/course");

// Helper: validate MongoDB IDs
const isValidId = (id) => mongoose.isValidObjectId(id);

// ================= ADD LESSON =================
const createLesson = async (req, res) => {
    try {
        const { title, description, videoUrl, order } = req.body;
        const { courseId } = req.params;

        if (!isValidId(courseId)) {
            return res.status(400).json({ message: "Invalid course ID" });
        }

        if (
            typeof title !== "string" || !title.trim() ||
            typeof description !== "string" || !description.trim() ||
            typeof videoUrl !== "string" || !videoUrl.trim()
        ) {
            return res.status(400).json({
                message: "Title, description and videoUrl are required"
            });
        }

        if (
            order !== undefined &&
            (!Number.isInteger(order) || order < 1)
        ) {
            return res.status(400).json({
                message: "Order must be a positive integer"
            });
        }

        const course = await Course.findOne({
            _id: courseId,
            instructor: req.user.id
        });

        if (!course) {
            return res.status(404).json({
                message: "Course not found or you do not own it"
            });
        }

        const lessonOrder = order ??
            ((await Lesson.countDocuments({ course: courseId })) + 1);

        const lesson = await Lesson.create({
            title: title.trim(),
            description: description.trim(),
            videoUrl: videoUrl.trim(),
            course: courseId,
            order: lessonOrder
        });

        return res.status(201).json({
            message: "Lesson created successfully",
            lesson
        });
    } catch (error) {
        console.error("Create lesson error:", error.message);
        return res.status(500).json({ message: "Server error" });
    }
};

// ================= GET COURSE LESSONS =================
const getLessons = async (req, res) => {
    try {
        const { courseId } = req.params;

        if (!isValidId(courseId)) {
            return res.status(400).json({ message: "Invalid course ID" });
        }

        // Instructors can view their own course lessons.
        // Published course lessons are publicly viewable for now.
        const course = await Course.findOne({
            _id: courseId,
            $or: [
                { isPublished: true },
                { instructor: req.user?.id || null }
            ]
        });

        if (!course) {
            return res.status(404).json({
                message: "Course not found or not published"
            });
        }

        const lessons = await Lesson.find({ course: courseId })
            .sort({ order: 1, createdAt: 1 });

        return res.status(200).json({
            count: lessons.length,
            lessons
        });
    } catch (error) {
        console.error("Get lessons error:", error.message);
        return res.status(500).json({ message: "Server error" });
    }
};

// ================= EDIT LESSON =================
const updateLesson = async (req, res) => {
    try {
        const { courseId, lessonId } = req.params;
        const { title, description, videoUrl, order } = req.body;

        if (!isValidId(courseId) || !isValidId(lessonId)) {
            return res.status(400).json({
                message: "Invalid course or lesson ID"
            });
        }

        const updates = {};

        if (title !== undefined) {
            if (typeof title !== "string" || !title.trim()) {
                return res.status(400).json({ message: "Invalid title" });
            }
            updates.title = title.trim();
        }

        if (description !== undefined) {
            if (typeof description !== "string" || !description.trim()) {
                return res.status(400).json({ message: "Invalid description" });
            }
            updates.description = description.trim();
        }

        if (videoUrl !== undefined) {
            if (typeof videoUrl !== "string" || !videoUrl.trim()) {
                return res.status(400).json({ message: "Invalid video URL" });
            }
            updates.videoUrl = videoUrl.trim();
        }

        if (order !== undefined) {
            if (!Number.isInteger(order) || order < 1) {
                return res.status(400).json({
                    message: "Order must be a positive integer"
                });
            }
            updates.order = order;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                message: "Provide at least one field to update"
            });
        }

        const course = await Course.findOne({
            _id: courseId,
            instructor: req.user.id
        });

        if (!course) {
            return res.status(404).json({
                message: "Course not found or you do not own it"
            });
        }

        const lesson = await Lesson.findOneAndUpdate(
            { _id: lessonId, course: courseId },
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!lesson) {
            return res.status(404).json({ message: "Lesson not found" });
        }

        return res.status(200).json({
            message: "Lesson updated successfully",
            lesson
        });
    } catch (error) {
        console.error("Update lesson error:", error.message);
        return res.status(500).json({ message: "Server error" });
    }
};

// ================= DELETE LESSON =================
const deleteLesson = async (req, res) => {
    try {
        const { courseId, lessonId } = req.params;

        if (!isValidId(courseId) || !isValidId(lessonId)) {
            return res.status(400).json({
                message: "Invalid course or lesson ID"
            });
        }

        const course = await Course.findOne({
            _id: courseId,
            instructor: req.user.id
        });

        if (!course) {
            return res.status(404).json({
                message: "Course not found or you do not own it"
            });
        }

        const lesson = await Lesson.findOneAndDelete({
            _id: lessonId,
            course: courseId
        });

        if (!lesson) {
            return res.status(404).json({ message: "Lesson not found" });
        }

        return res.status(200).json({
            message: "Lesson deleted successfully"
        });
    } catch (error) {
        console.error("Delete lesson error:", error.message);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    createLesson,
    getLessons,
    updateLesson,
    deleteLesson
};