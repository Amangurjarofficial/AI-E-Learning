
const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
    {
        questionText: {
            type: String,
            required: true,
            trim: true
        },
        options: {
            type: [String],
            required: true,
            validate: {
                validator: function (options) {
                    return options.length === 4;
                },
                message: "Each question must have exactly 4 options"
            }
        },
        correctAnswer: {
            type: Number,
            required: true,
            min: 0,
            max: 3
        },
        explanation: {
            type: String,
            default: ""
        }
    },
    { _id: true }
);

const quizSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true
        },
        lesson: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lesson",
            required: true
        },
        questions: {
            type: [questionSchema],
            validate: {
                validator: function (questions) {
                    return questions.length > 0;
                },
                message: "A quiz must contain at least one question"
            }
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Quiz", quizSchema);
