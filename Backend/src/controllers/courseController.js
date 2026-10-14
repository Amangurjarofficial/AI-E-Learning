const Course = require("../models/Course");
const Lesson = require("../models/Lesson");

// ================= CREATE COURSE =================
const createCourse = async (req, res) => {
    try {
        const { title, description, category, price, thumbnail } = req.body;

        if (
            typeof title !== "string" ||
            !title.trim() ||
            typeof description !== "string" ||
            !description.trim() ||
            typeof category !== "string" ||
            !category.trim()
        ) {
            return res.status(400).json({
                message: "Title, description and category are required"
            });
        }

        const course = await Course.create({
            title: title.trim(),
            description: description.trim(),
            category: category.trim(),
            price: price ?? 0,
            thumbnail: thumbnail ?? "",
            instructor: req.user.id
        });

        return res.status(201).json({
            message: "Course created successfully",
            course
        });
    } catch (error) {
        console.error("Create course error:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Server error while creating course"
        });
    }
};

// ================= GET PUBLISHED COURSES =================
const getCourses = async (req, res) => {
    try {
        const courses = await Course.find({
            isPublished: true
        }).populate("instructor", "name");

        return res.status(200).json({
            count: courses.length,
            courses
        });
    } catch (error) {
        console.error("Get courses error:", error);

        return res.status(500).json({
            message: "Failed to fetch courses"
        });
    }
};

// ================= GET MY COURSES =================
const getMyCourses = async (req, res) => {
    try {
        const courses = await Course.find({
            instructor: req.user.id
        }).populate("instructor", "name");

        return res.status(200).json({
            count: courses.length,
            courses
        });
    } catch (error) {
        console.error("Get my courses error:", error);

        return res.status(500).json({
            message: "Failed to fetch your courses"
        });
    }
};

// ================= GET COURSE DETAILS =================
const getCourseById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            return res.status(400).json({
                message: "Invalid course ID"
            });
        }

        const course = await Course.findById(id)
            .populate("instructor", "name")
            .lean();

        if (!course) {
            return res.status(404).json({
                message: "Course not found"
            });
        }

        // Only published courses are publicly accessible.
        if (!course.isPublished) {
            return res.status(404).json({
                message: "Published course not found"
            });
        }

        const lessons = await Lesson.find({
            course: course._id
        })
            .sort({ createdAt: 1 })
            .lean();

        return res.status(200).json({
            course: {
                ...course,
                lessons
            }
        });
    } catch (error) {
        console.error("Get course details error:", error);

        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid course ID"
            });
        }

        return res.status(500).json({
            message: "Failed to fetch course details"
        });
    }
};

// ================= PUBLISH COURSE =================
const publishCourse = async (req, res) => {
    try {
        const { id } = req.params;

        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            return res.status(400).json({
                message: "Invalid course ID"
            });
        }

        const course = await Course.findOne({
            _id: id,
            instructor: req.user.id
        });

        if (!course) {
            return res.status(404).json({
                message: "Course not found or you do not own it"
            });
        }

        course.isPublished = true;
        await course.save();

        return res.status(200).json({
            message: "Course published successfully",
            course
        });
    } catch (error) {
        console.error("Publish course error:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Failed to publish course"
        });
    }
};

// ================= EDIT COURSE =================
const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;

        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            return res.status(400).json({
                message: "Invalid course ID"
            });
        }

        const allowedFields = [
            "title",
            "description",
            "category",
            "price",
            "thumbnail"
        ];

        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                message: "Provide at least one field to update"
            });
        }

        if (updates.title !== undefined) {
            if (
                typeof updates.title !== "string" ||
                !updates.title.trim()
            ) {
                return res.status(400).json({
                    message: "Title must be a non-empty string"
                });
            }

            updates.title = updates.title.trim();
        }

        if (updates.category !== undefined) {
            if (
                typeof updates.category !== "string" ||
                !updates.category.trim()
            ) {
                return res.status(400).json({
                    message: "Category must be a non-empty string"
                });
            }

            updates.category = updates.category.trim();
        }

        if (updates.description !== undefined) {
            if (
                typeof updates.description !== "string" ||
                !updates.description.trim()
            ) {
                return res.status(400).json({
                    message: "Description must be a non-empty string"
                });
            }

            updates.description = updates.description.trim();
        }

        if (updates.price !== undefined) {
            const price = Number(updates.price);

            if (!Number.isFinite(price) || price < 0) {
                return res.status(400).json({
                    message: "Price must be a non-negative number"
                });
            }

            updates.price = price;
        }

        if (
            updates.thumbnail !== undefined &&
            typeof updates.thumbnail !== "string"
        ) {
            return res.status(400).json({
                message: "Thumbnail must be a string"
            });
        }

        const course = await Course.findOneAndUpdate(
            {
                _id: id,
                instructor: req.user.id
            },
            { $set: updates },
            {
                new: true,
                runValidators: true
            }
        );

        if (!course) {
            return res.status(404).json({
                message: "Course not found or you do not own it"
            });
        }

        return res.status(200).json({
            message: "Course updated successfully",
            course
        });
    } catch (error) {
        console.error("Update course error:", error);

        if (
            error.name === "ValidationError" ||
            error.name === "CastError"
        ) {
            return res.status(400).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Failed to update course"
        });
    }
};

// ================= DELETE COURSE =================
const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;

        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            return res.status(400).json({
                message: "Invalid course ID"
            });
        }

        const course = await Course.findOneAndDelete({
            _id: id,
            instructor: req.user.id
        });

        if (!course) {
            return res.status(404).json({
                message: "Course not found or you do not own it"
            });
        }

        return res.status(200).json({
            message: "Course deleted successfully"
        });
    } catch (error) {
        console.error("Delete course error:", error);

        return res.status(500).json({
            message: "Failed to delete course"
        });
    }
};

// ================= EXPORT CONTROLLERS =================
module.exports = {
    createCourse,
    getCourses,
    getMyCourses,
    getCourseById,
    publishCourse,
    updateCourse,
    deleteCourse
};