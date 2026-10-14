
// const mongoose = require("mongoose");

// const Quiz = require("../models/Quiz");
// const Course = require("../models/Course");
// const Lesson = require("../models/Lesson");
// const Enrollment = require("../models/Enrollment");

// // GENERATE QUIZ USING GEMINI
// const generateQuiz = async (req, res) => {
//     try {
//         const { courseId, lessonId } = req.params;
//         const numberOfQuestions =
//             req.body?.numberOfQuestions ?? 5;

//         if (
//             !mongoose.isValidObjectId(courseId) ||
//             !mongoose.isValidObjectId(lessonId)
//         ) {
//             return res.status(400).json({
//                 message: "Invalid course ID or lesson ID"
//             });
//         }

//         if (
//             !Number.isInteger(numberOfQuestions) ||
//             numberOfQuestions < 1 ||
//             numberOfQuestions > 10
//         ) {
//             return res.status(400).json({
//                 message:
//                     "numberOfQuestions must be an integer between 1 and 10"
//             });
//         }

//         if (!process.env.GEMINI_API_KEY) {
//             return res.status(500).json({
//                 message: "Gemini API key is not configured"
//             });
//         }

//         const course = await Course.findOne({
//             _id: courseId,
//             instructor: req.user.id
//         });

//         if (!course) {
//             return res.status(404).json({
//                 message: "Course not found or you do not own it"
//             });
//         }

//         const lesson = await Lesson.findOne({
//             _id: lessonId,
//             course: courseId
//         });

//         if (!lesson) {
//             return res.status(404).json({
//                 message: "Lesson not found in this course"
//             });
//         }

//         // Dynamic import for CommonJS projects
//         const { GoogleGenAI } = await import("@google/genai");

//         const ai = new GoogleGenAI({
//             apiKey: process.env.GEMINI_API_KEY
//         });

//         const prompt = `
// Create exactly ${numberOfQuestions} multiple-choice questions
// based on the following lesson.

// Course: ${course.title}
// Lesson: ${lesson.title}
// Description: ${lesson.description}

// Return only JSON in this format:
// {
//   "questions": [
//     {
//       "questionText": "Question here",
//       "options": ["Option A", "Option B", "Option C", "Option D"],
//       "correctAnswer": 0,
//       "explanation": "Explanation here"
//     }
//   ]
// }

// Rules:
// - Generate exactly ${numberOfQuestions} questions.
// - Every question must have exactly four options.
// - correctAnswer must be an integer from 0 to 3.
// - Questions must be educational and relevant to the lesson.
// - Do not include Markdown or text outside the JSON.
// `;

//         const response = await ai.models.generateContent({
//             model: "gemini-flash-latest",
//             contents: prompt,
//             config: {
//                 responseMimeType: "application/json"
//             }
//         });

//         let parsed;

//         try {
//             parsed = JSON.parse(response.text);
//         } catch {
//             return res.status(502).json({
//                 message: "AI returned invalid JSON. Please try again."
//             });
//         }

//         const questions = parsed?.questions;

//         const validQuestions =
//             Array.isArray(questions) &&
//             questions.length === numberOfQuestions &&
//             questions.every((q) =>
//                 q &&
//                 typeof q.questionText === "string" &&
//                 q.questionText.trim().length > 0 &&
//                 Array.isArray(q.options) &&
//                 q.options.length === 4 &&
//                 q.options.every(
//                     (option) =>
//                         typeof option === "string" &&
//                         option.trim().length > 0
//                 ) &&
//                 Number.isInteger(q.correctAnswer) &&
//                 q.correctAnswer >= 0 &&
//                 q.correctAnswer <= 3 &&
//                 typeof q.explanation === "string"
//             );

//         if (!validQuestions) {
//             return res.status(502).json({
//                 message: "AI generated an invalid quiz. Please try again."
//             });
//         }

//         const quiz = await Quiz.create({
//             title: `${lesson.title} Quiz`,
//             course: courseId,
//             lesson: lessonId,
//             questions,
//             createdBy: req.user.id
//         });

//         return res.status(201).json({
//             message: "Quiz generated successfully",
//             quiz: {
//                 _id: quiz._id,
//                 title: quiz.title,
//                 course: quiz.course,
//                 lesson: quiz.lesson,
//                 questionCount: quiz.questions.length
//             }
//         });
//     } catch (error) {
//         console.error("Generate quiz error:", error);

//         return res.status(500).json({
//             message: "Unable to generate quiz right now"
//         });
//     }
// };

// // GET QUIZ WITHOUT REVEALING CORRECT ANSWERS
// const getQuiz = async (req, res) => {
//     try {
//         const { quizId } = req.params;

//         if (!mongoose.isValidObjectId(quizId)) {
//             return res.status(400).json({
//                 message: "Invalid quiz ID"
//             });
//         }

//         const quiz = await Quiz.findById(quizId);

//         if (!quiz) {
//             return res.status(404).json({
//                 message: "Quiz not found"
//             });
//         }

//         const course = await Course.findOne({
//             _id: quiz.course,
//             isPublished: true
//         });

//         if (!course) {
//             return res.status(404).json({
//                 message: "Course not found or not published"
//             });
//         }

//         const enrollment = await Enrollment.findOne({
//             student: req.user.id,
//             course: quiz.course
//         });

//         if (!enrollment) {
//             return res.status(403).json({
//                 message: "Enroll in this course to access its quiz"
//             });
//         }

//         const safeQuestions = quiz.questions.map((q) => ({
//             _id: q._id,
//             questionText: q.questionText,
//             options: q.options
//         }));

//         return res.status(200).json({
//             quizId: quiz._id,
//             title: quiz.title,
//             questions: safeQuestions
//         });
//     } catch (error) {
//         console.error("Get quiz error:", error);

//         return res.status(500).json({
//             message: "Unable to retrieve quiz"
//         });
//     }
// };

// // SUBMIT ANSWERS AND CALCULATE SCORE
// const submitQuiz = async (req, res) => {
//     try {
//         const { quizId } = req.params;
//         const { answers } = req.body || {};

//         if (!mongoose.isValidObjectId(quizId)) {
//             return res.status(400).json({
//                 message: "Invalid quiz ID"
//             });
//         }

//         if (
//             !Array.isArray(answers) ||
//             answers.length === 0 ||
//             answers.some(
//                 (answer) =>
//                     !Number.isInteger(answer) ||
//                     answer < 0 ||
//                     answer > 3
//             )
//         ) {
//             return res.status(400).json({
//                 message:
//                     "Answers must be a non-empty array of option indexes from 0 to 3"
//             });
//         }

//         const quiz = await Quiz.findById(quizId);

//         if (!quiz) {
//             return res.status(404).json({
//                 message: "Quiz not found"
//             });
//         }

//         const course = await Course.findOne({
//             _id: quiz.course,
//             isPublished: true
//         });

//         if (!course) {
//             return res.status(404).json({
//                 message: "Course not found or not published"
//             });
//         }

//         const enrollment = await Enrollment.findOne({
//             student: req.user.id,
//             course: quiz.course
//         });

//         if (!enrollment) {
//             return res.status(403).json({
//                 message:
//                     "Enroll in this course before submitting its quiz"
//             });
//         }

//         if (answers.length !== quiz.questions.length) {
//             return res.status(400).json({
//                 message:
//                     `Submit exactly ${quiz.questions.length} answers`
//             });
//         }

//         let score = 0;

//         const results = quiz.questions.map((question, index) => {
//             const isCorrect =
//                 answers[index] === question.correctAnswer;

//             if (isCorrect) {
//                 score++;
//             }

//             return {
//                 question: question.questionText,
//                 selectedOption: answers[index],
//                 correctOption: question.correctAnswer,
//                 isCorrect,
//                 explanation: question.explanation
//             };
//         });

//         const percentage = Math.round(
//             (score / quiz.questions.length) * 100
//         );

//         return res.status(200).json({
//             message: "Quiz submitted successfully",
//             totalQuestions: quiz.questions.length,
//             correctAnswers: score,
//             score: percentage,
//             results
//         });
//     } catch (error) {
//         console.error("Submit quiz error:", error);

//         return res.status(500).json({
//             message: "Unable to submit quiz",
//             error: error.message
//         });
//     }
// };

// module.exports = {
//     generateQuiz,
//     getQuiz,
//     submitQuiz
// };



const mongoose = require("mongoose");

const Quiz = require("../models/Quiz");
const Course = require("../models/Course");
const Lesson = require("../models/Lesson");
const Enrollment = require("../models/Enrollment");

// Delay helper for retrying temporary Gemini errors
const sleep = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms));

// Generate content with retries and a fallback model
async function generateWithRetry(ai, prompt) {
    const models = [
        process.env.GEMINI_MODEL,
        process.env.GEMINI_FALLBACK_MODEL,
        "gemini-3.8-flash"
    ];

    let lastError;

    for (const model of [...new Set(models.filter(Boolean))]) {
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                console.log(
                    `Generating quiz with ${model}, attempt ${attempt + 1}`
                );

                return await ai.models.generateContent({
                    model,
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json"
                    }
                });
            } catch (error) {
                lastError = error;

                const status = Number(error.status || error.code);

                if (status === 404) {
                    console.warn(
                        `${model} is unavailable. Trying the next model.`
                    );
                    break;
                }

                // Retry temporary errors only
                if (![408, 429, 500, 502, 503, 504].includes(status)) {
                    throw error;
                }

                if (attempt < 2) {
                    const delay = 1000 * 2 ** attempt;

                    console.warn(
                        `${model} returned ${status}. Retrying in ${delay} ms.`
                    );

                    await sleep(delay);
                }
            }
        }

        console.warn(`Model ${model} failed. Trying the next model.`);
    }

    throw lastError;
}

// GENERATE QUIZ USING GEMINI
const generateQuiz = async (req, res) => {
    try {
        const { courseId, lessonId } = req.params;

        const numberOfQuestions =
            req.body?.numberOfQuestions ?? 5;

        if (
            !mongoose.isValidObjectId(courseId) ||
            !mongoose.isValidObjectId(lessonId)
        ) {
            return res.status(400).json({
                message: "Invalid course ID or lesson ID"
            });
        }

        if (
            !Number.isInteger(numberOfQuestions) ||
            numberOfQuestions < 1 ||
            numberOfQuestions > 10
        ) {
            return res.status(400).json({
                message:
                    "numberOfQuestions must be an integer between 1 and 10"
            });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                message: "Gemini API key is not configured"
            });
        }

        // Verify course ownership
        const course = await Course.findOne({
            _id: courseId,
            instructor: req.user.id
        });

        if (!course) {
            return res.status(404).json({
                message: "Course not found or you do not own it"
            });
        }

        // Verify lesson belongs to this course
        const lesson = await Lesson.findOne({
            _id: lessonId,
            course: courseId
        });

        if (!lesson) {
            return res.status(404).json({
                message: "Lesson not found in this course"
            });
        }

        // Initialize Gemini
        const { GoogleGenAI } = await import("@google/genai");

        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY
        });

        const prompt = `
Create exactly ${numberOfQuestions} multiple-choice questions
based on the lesson below.

Course: ${course.title}
Lesson: ${lesson.title}
Description: ${lesson.description || "No description provided"}

Return only valid JSON in this format:
{
  "questions": [
    {
      "questionText": "Question here",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "correctAnswer": 0,
      "explanation": "Explanation here"
    }
  ]
}

Rules:
- Generate exactly ${numberOfQuestions} questions.
- Every question must have exactly four distinct options.
- correctAnswer must be an integer from 0 to 3.
- Every question must be relevant to the lesson.
- Provide a clear explanation for each answer.
- Do not include Markdown or text outside the JSON.
`;

        // Generate with retry and fallback
        const response = await generateWithRetry(ai, prompt);

        if (!response.text) {
            return res.status(502).json({
                message: "Gemini returned an empty response. Please try again."
            });
        }

        let parsed;

        try {
            parsed = JSON.parse(response.text);
        } catch (error) {
            console.error("Invalid Gemini JSON:", error.message);

            return res.status(502).json({
                message: "AI returned invalid JSON. Please try again."
            });
        }

        const questions = parsed?.questions;

        const validQuestions =
            Array.isArray(questions) &&
            questions.length === numberOfQuestions &&
            questions.every((q) =>
                q &&
                typeof q.questionText === "string" &&
                q.questionText.trim().length > 0 &&
                Array.isArray(q.options) &&
                q.options.length === 4 &&
                q.options.every(
                    (option) =>
                        typeof option === "string" &&
                        option.trim().length > 0
                ) &&
                new Set(q.options).size === 4 &&
                Number.isInteger(q.correctAnswer) &&
                q.correctAnswer >= 0 &&
                q.correctAnswer <= 3 &&
                typeof q.explanation === "string" &&
                q.explanation.trim().length > 0
            );

        if (!validQuestions) {
            return res.status(502).json({
                message: "AI generated an invalid quiz. Please try again."
            });
        }

        // Save generated quiz
        const quiz = await Quiz.create({
            title: `${lesson.title} Quiz`,
            course: courseId,
            lesson: lessonId,
            questions,
            createdBy: req.user.id
        });

        return res.status(201).json({
            message: "Quiz generated successfully",
            quiz: {
                _id: quiz._id,
                title: quiz.title,
                course: quiz.course,
                lesson: quiz.lesson,
                questionCount: quiz.questions.length
            }
        });
    } catch (error) {
        console.error("Generate quiz error:", error);

        const status = Number(error.status || error.code);

        if ([408, 429, 500, 502, 503, 504].includes(status)) {
            return res.status(503).json({
                message:
                    "Gemini is temporarily unavailable. Please wait a moment and try again."
            });
        }

        return res.status(500).json({
            message: "Unable to generate quiz right now."
        });
    }
};

// GET QUIZ WITHOUT REVEALING CORRECT ANSWERS
const getQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;

        if (!mongoose.isValidObjectId(quizId)) {
            return res.status(400).json({
                message: "Invalid quiz ID"
            });
        }

        const quiz = await Quiz.findById(quizId);

        if (!quiz) {
            return res.status(404).json({
                message: "Quiz not found"
            });
        }

        const course = await Course.findOne({
            _id: quiz.course,
            isPublished: true
        });

        if (!course) {
            return res.status(404).json({
                message: "Course not found or not published"
            });
        }

        const enrollment = await Enrollment.findOne({
            student: req.user.id,
            course: quiz.course
        });

        if (!enrollment) {
            return res.status(403).json({
                message: "Enroll in this course to access its quiz"
            });
        }

        const safeQuestions = quiz.questions.map((q) => ({
            _id: q._id,
            questionText: q.questionText,
            options: q.options
        }));

        return res.status(200).json({
            quizId: quiz._id,
            title: quiz.title,
            questions: safeQuestions
        });
    } catch (error) {
        console.error("Get quiz error:", error);

        return res.status(500).json({
            message: "Unable to retrieve quiz"
        });
    }
};

// LIST QUIZZES FOR A COURSE THE STUDENT IS ENROLLED IN
const getQuizzesForCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        if (!mongoose.isValidObjectId(courseId)) {
            return res.status(400).json({
                message: "Invalid course ID"
            });
        }

        const course = await Course.findOne({
            _id: courseId,
            isPublished: true
        });

        if (!course) {
            return res.status(404).json({
                message: "Course not found or not published"
            });
        }

        const enrollment = await Enrollment.findOne({
            student: req.user.id,
            course: courseId
        });

        if (!enrollment) {
            return res.status(403).json({
                message: "Enroll in this course to access its quizzes"
            });
        }

        const quizzes = await Quiz.find({ course: courseId })
            .select("title lesson questions createdAt")
            .populate("lesson", "title")
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            count: quizzes.length,
            quizzes: quizzes.map((quiz) => ({
                _id: quiz._id,
                title: quiz.title,
                lesson: quiz.lesson,
                questionCount: quiz.questions.length,
                createdAt: quiz.createdAt
            }))
        });
    } catch (error) {
        console.error("Get course quizzes error:", error);

        return res.status(500).json({
            message: "Unable to retrieve quizzes for this course"
        });
    }
};

// SUBMIT ANSWERS AND CALCULATE SCORE
const submitQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        const { answers } = req.body || {};

        if (!mongoose.isValidObjectId(quizId)) {
            return res.status(400).json({
                message: "Invalid quiz ID"
            });
        }

        if (
            !Array.isArray(answers) ||
            answers.length === 0 ||
            answers.some(
                (answer) =>
                    !Number.isInteger(answer) ||
                    answer < 0 ||
                    answer > 3
            )
        ) {
            return res.status(400).json({
                message:
                    "Answers must be a non-empty array of option indexes from 0 to 3"
            });
        }

        const quiz = await Quiz.findById(quizId);

        if (!quiz) {
            return res.status(404).json({
                message: "Quiz not found"
            });
        }

        const course = await Course.findOne({
            _id: quiz.course,
            isPublished: true
        });

        if (!course) {
            return res.status(404).json({
                message: "Course not found or not published"
            });
        }

        const enrollment = await Enrollment.findOne({
            student: req.user.id,
            course: quiz.course
        });

        if (!enrollment) {
            return res.status(403).json({
                message: "Enroll in this course before submitting its quiz"
            });
        }

        if (answers.length !== quiz.questions.length) {
            return res.status(400).json({
                message: `Submit exactly ${quiz.questions.length} answers`
            });
        }

        let score = 0;

        const results = quiz.questions.map((question, index) => {
            const isCorrect =
                answers[index] === question.correctAnswer;

            if (isCorrect) {
                score++;
            }

            return {
                question: question.questionText,
                selectedOption: answers[index],
                correctOption: question.correctAnswer,
                isCorrect,
                explanation: question.explanation
            };
        });

        const percentage = Math.round(
            (score / quiz.questions.length) * 100
        );

        return res.status(200).json({
            message: "Quiz submitted successfully",
            totalQuestions: quiz.questions.length,
            correctAnswers: score,
            score: percentage,
            results
        });
    } catch (error) {
        console.error("Submit quiz error:", error);

        return res.status(500).json({
            message: "Unable to submit quiz"
        });
    }
};

module.exports = {
    generateQuiz,
    getQuizzesForCourse,
    getQuiz,
    submitQuiz
};
