
import { useCallback, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";

function InstructorDashboard() {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedLesson, setSelectedLesson] = useState("");

  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    category: "",
    price: "0",
    thumbnail: "",
  });

  const [lessonForm, setLessonForm] = useState({
    title: "",
    description: "",
    videoUrl: "",
    order: "1",
  });

  const [numberOfQuestions, setNumberOfQuestions] = useState("5");
  const [generatedQuiz, setGeneratedQuiz] = useState(null);

  const [quizForm, setQuizForm] = useState({
    title: "",
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "0",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const inputClass =
    "mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-cyan-400";

  const labelClass = "block text-sm font-medium text-slate-300";

  const buttonClass =
    "rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50";

  const showError = (err) => {
    setError(
      err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Something went wrong."
    );
  };

  const extractList = (data, key) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.[key])) return data[key];
    if (Array.isArray(data?.data)) return data.data;
    return [];
  };

  // Load the logged-in instructor's courses.
  const loadCourses = useCallback(async () => {
    try {
      setError("");

      const response = await api.get("/courses/my-courses");
      const list = extractList(response.data, "courses");

      setCourses(list);

      setSelectedCourse((current) => {
        if (list.some((course) => course._id === current)) {
          return current;
        }
        return list[0]?._id || "";
      });
    } catch (err) {
      showError(err);
    }
  }, []);

  useEffect(() => {
    try {
      setUser(JSON.parse(localStorage.getItem("user") || "null"));
    } catch {
      setUser(null);
    }

    loadCourses();
  }, [loadCourses]);

  // Load lessons when the selected course changes.
  const loadLessons = useCallback(async (courseId) => {
    setLessons([]);
    setSelectedLesson("");
    setGeneratedQuiz(null);

    if (!courseId) return;

    try {
      setError("");

      const response = await api.get(
        `/courses/${courseId}/lessons`
      );

      setLessons(extractList(response.data, "lessons"));
    } catch (err) {
      showError(err);
    }
  }, []);

  useEffect(() => {
    loadLessons(selectedCourse);
  }, [selectedCourse, loadLessons]);

  // Create a course.
  const handleCreateCourse = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await api.post("/courses", {
        ...courseForm,
        price: Number(courseForm.price),
      });

      const created =
        response.data.course ||
        response.data.data ||
        (response.data._id ? response.data : null);

      setMessage(
        response.data.message ||
          "Course created successfully. It is a draft until published."
      );

      setCourseForm({
        title: "",
        description: "",
        category: "",
        price: "0",
        thumbnail: "",
      });

      await loadCourses();

      if (created?._id) {
        setSelectedCourse(created._id);
      }
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  };

  // Publish a course.
  const handlePublishCourse = async (courseId) => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await api.patch(
        `/courses/${courseId}/publish`
      );

      setMessage(
        response.data.message || "Course published successfully."
      );

      await loadCourses();
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  };

  // Delete a course.
  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await api.delete(`/courses/${courseId}`);

      setMessage(response.data.message || "Course deleted successfully.");

      await loadCourses();
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  };

  // Add a lesson to the selected course.
  const handleCreateLesson = async (e) => {
    e.preventDefault();

    if (!selectedCourse) {
      setError("Please create or select a course first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await api.post(
        `/courses/${selectedCourse}/lessons`,
        {
          ...lessonForm,
          title: lessonForm.title.trim(),
          description: lessonForm.description.trim(),
          videoUrl: lessonForm.videoUrl.trim(),
          order: Number(lessonForm.order),
        }
      );

      setMessage(response.data.message || "Lesson added successfully.");

      setLessonForm({
        title: "",
        description: "",
        videoUrl: "",
        order: String(lessons.length + 2),
      });

      await loadLessons(selectedCourse);
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  };

  // Generate an AI quiz for the selected lesson.
  const handleGenerateQuiz = async (e) => {
    e.preventDefault();

    if (!selectedCourse || !selectedLesson) {
      setError("Select a course and lesson first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");
      setGeneratedQuiz(null);

      const response = await api.post(
        `/quizzes/courses/${selectedCourse}/lessons/${selectedLesson}/generate`,
        { numberOfQuestions: Number(numberOfQuestions) }
      );

      const data = response.data;
      const quiz = data.quiz || data.data || data;

      setGeneratedQuiz(quiz);
      setMessage(data.message || "Quiz generated successfully.");
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  };

  // Save a manually written quiz containing one question.
  const handleSaveQuiz = async (e) => {
    e.preventDefault();

    if (!selectedCourse || !selectedLesson) {
      setError("Select a course and lesson first.");
      return;
    }

    if (quizForm.options.some((option) => !option.trim())) {
      setError("Please fill in all four answer options.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await api.post(
        `/quizzes/courses/${selectedCourse}/lessons/${selectedLesson}`,
        {
          title: quizForm.title.trim(),
          questions: [
            {
              question: quizForm.question.trim(),
              options: quizForm.options.map((option) => option.trim()),
              correctAnswer: Number(quizForm.correctAnswer),
            },
          ],
        }
      );

      setMessage(response.data.message || "Quiz saved successfully.");

      setQuizForm({
        title: "",
        question: "",
        options: ["", "", "", ""],
        correctAnswer: "0",
      });
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl space-y-8 p-5 sm:p-8">
        <header>
          <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
          <p className="mt-2 text-slate-400">
            Welcome, {user?.name || user?.email || "Instructor"}. Manage
            courses, lessons, publishing, and quizzes.
          </p>
        </header>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-800 bg-red-950 p-3 text-red-300"
          >
            {error}
          </div>
        )}

        {message && (
          <div
            role="status"
            className="rounded-lg border border-emerald-800 bg-emerald-950 p-3 text-emerald-300"
          >
            {message}
          </div>
        )}

        {loading && (
          <p className="text-sm text-cyan-400">Processing request...</p>
        )}

        {/* CREATE COURSE */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-7">
          <h2 className="text-xl font-semibold text-cyan-400">
            Create Course
          </h2>

          <form
            onSubmit={handleCreateCourse}
            className="mt-5 grid gap-4 sm:grid-cols-2"
          >
            <label className={labelClass}>
              Course title *
              <input
                className={inputClass}
                required
                value={courseForm.title}
                onChange={(e) =>
                  setCourseForm({ ...courseForm, title: e.target.value })
                }
              />
            </label>

            <label className={labelClass}>
              Category *
              <input
                className={inputClass}
                required
                value={courseForm.category}
                onChange={(e) =>
                  setCourseForm({ ...courseForm, category: e.target.value })
                }
              />
            </label>

            <label className={labelClass}>
              Price
              <input
                className={inputClass}
                type="number"
                min="0"
                required
                value={courseForm.price}
                onChange={(e) =>
                  setCourseForm({ ...courseForm, price: e.target.value })
                }
              />
            </label>

            <label className={labelClass}>
              Thumbnail URL
              <input
                className={inputClass}
                type="url"
                value={courseForm.thumbnail}
                onChange={(e) =>
                  setCourseForm({ ...courseForm, thumbnail: e.target.value })
                }
                placeholder="https://example.com/image.jpg"
              />
            </label>

            <label className={`${labelClass} sm:col-span-2`}>
              Description *
              <textarea
                className={inputClass}
                required
                rows={3}
                value={courseForm.description}
                onChange={(e) =>
                  setCourseForm({
                    ...courseForm,
                    description: e.target.value,
                  })
                }
              />
            </label>

            <div className="sm:col-span-2">
              <button className={buttonClass} disabled={loading}>
                Create Course
              </button>
            </div>
          </form>
        </section>

        {/* MANAGE AND PUBLISH COURSES */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-cyan-400">
              Manage Courses
            </h2>

            <button
              type="button"
              className={buttonClass}
              onClick={loadCourses}
              disabled={loading}
            >
              Refresh Courses
            </button>
          </div>

          {courses.length === 0 ? (
            <p className="mt-5 text-slate-400">
              No courses found. Create your first course above.
            </p>
          ) : (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {courses.map((course) => (
                <article
                  key={course._id}
                  className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                >
                  {course.thumbnail && (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/course-placeholder.svg";
                      }}
                      className="mb-4 h-40 w-full rounded-lg object-cover"
                    />
                  )}

                  <h3 className="text-lg font-semibold">{course.title}</h3>

                  <p className="mt-2 text-sm text-slate-400">
                    {course.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                    <span className="rounded bg-slate-800 px-2 py-1">
                      {course.category || "Uncategorized"}
                    </span>
                    <span className="rounded bg-slate-800 px-2 py-1">
                      Price: {course.price ?? 0}
                    </span>
                    <span className="rounded bg-slate-800 px-2 py-1">
                      {course.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      className={buttonClass}
                      onClick={() => setSelectedCourse(course._id)}
                    >
                      {selectedCourse === course._id
                        ? "Selected"
                        : "Select Course"}
                    </button>

                    {!course.isPublished && (
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => handlePublishCourse(course._id)}
                        className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
                      >
                        Publish Course
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleDeleteCourse(course._id)}
                      className="rounded-lg border border-red-700 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-950 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* ADD LESSONS */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-7">
          <h2 className="text-xl font-semibold text-cyan-400">Add Lessons</h2>

          <label className={`${labelClass} mt-5`}>
            Select course *
            <select
              className={inputClass}
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              required
            >
              <option value="">Choose a course</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
          </label>

          <form
            onSubmit={handleCreateLesson}
            className="mt-4 grid gap-4 sm:grid-cols-2"
          >
            <label className={labelClass}>
              Lesson title *
              <input
                className={inputClass}
                required
                value={lessonForm.title}
                onChange={(e) =>
                  setLessonForm({ ...lessonForm, title: e.target.value })
                }
              />
            </label>

            <label className={labelClass}>
              Video URL
              <input
                className={inputClass}
                type="url"
                value={lessonForm.videoUrl}
                onChange={(e) =>
                  setLessonForm({ ...lessonForm, videoUrl: e.target.value })
                }
                placeholder="https://..."
              />
            </label>

            <label className={labelClass}>
              Lesson order
              <input
                className={inputClass}
                type="number"
                min="1"
                required
                value={lessonForm.order}
                onChange={(e) =>
                  setLessonForm({ ...lessonForm, order: e.target.value })
                }
              />
            </label>

            <label className={`${labelClass} sm:col-span-2`}>
              Description *
              <textarea
                className={inputClass}
                required
                rows={3}
                value={lessonForm.description}
                onChange={(e) =>
                  setLessonForm({
                    ...lessonForm,
                    description: e.target.value,
                  })
                }
              />
            </label>

            <div className="sm:col-span-2">
              <button
                className={buttonClass}
                type="submit"
                disabled={loading || !selectedCourse}
              >
                Add Lesson
              </button>
            </div>
          </form>

          <div className="mt-6">
            <h3 className="font-semibold">Existing Lessons</h3>

            {lessons.length === 0 ? (
              <p className="mt-2 text-sm text-slate-400">
                No lessons found. Select a course and add a lesson.
              </p>
            ) : (
              <div className="mt-3 space-y-2">
                {lessons.map((lesson, index) => (
                  <div
                    key={lesson._id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800 p-3"
                  >
                    <div>
                      <p className="font-medium">
                        {lesson.order ?? index + 1}. {lesson.title}
                      </p>
                      <p className="text-sm text-slate-400">
                        {lesson.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedLesson(lesson._id)}
                      className={
                        selectedLesson === lesson._id
                          ? "rounded-lg bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950"
                          : "rounded-lg border border-slate-700 px-3 py-2 text-sm hover:border-cyan-400"
                      }
                    >
                      {selectedLesson === lesson._id
                        ? "Selected for Quiz"
                        : "Use for Quiz"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* AI QUIZ GENERATION */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-7">
          <h2 className="text-xl font-semibold text-cyan-400">
            Generate AI Quiz
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Select a course and lesson before generating the quiz.
          </p>

          <form
            onSubmit={handleGenerateQuiz}
            className="mt-5 grid gap-4 sm:grid-cols-2"
          >
            <label className={labelClass}>
              Course *
              <select
                className={inputClass}
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                required
              >
                <option value="">Choose a course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </label>

            <label className={labelClass}>
              Lesson *
              <select
                className={inputClass}
                value={selectedLesson}
                onChange={(e) => setSelectedLesson(e.target.value)}
                required
              >
                <option value="">Choose a lesson</option>
                {lessons.map((lesson) => (
                  <option key={lesson._id} value={lesson._id}>
                    {lesson.title}
                  </option>
                ))}
              </select>
            </label>

            <label className={labelClass}>
              Number of questions
              <select
                className={inputClass}
                value={numberOfQuestions}
                onChange={(e) => setNumberOfQuestions(e.target.value)}
              >
                <option value="5">5 Questions</option>
                <option value="10">10 Questions</option>
                <option value="15">15 Questions</option>
              </select>
            </label>

            <div className="flex items-end">
              <button
                className={buttonClass}
                type="submit"
                disabled={loading || !selectedCourse || !selectedLesson}
              >
                Generate AI Quiz
              </button>
            </div>
          </form>

          {generatedQuiz && (
            <div className="mt-6 rounded-xl border border-emerald-800 bg-emerald-950/40 p-4">
              <h3 className="font-semibold text-emerald-300">
                Quiz generated successfully
              </h3>

              {generatedQuiz._id && (
                <p className="mt-2 break-all text-sm text-slate-300">
                  Quiz ID: {generatedQuiz._id}
                </p>
              )}

              {generatedQuiz.title && (
                <p className="mt-2">{generatedQuiz.title}</p>
              )}

              {Array.isArray(generatedQuiz.questions) && (
                <p className="mt-1 text-sm text-slate-400">
                  {generatedQuiz.questions.length} questions
                </p>
              )}
            </div>
          )}
        </section>

        {/* MANUAL QUIZ CREATION */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-7">
          <h2 className="text-xl font-semibold text-cyan-400">
            Add Quiz Manually
          </h2>

          <form onSubmit={handleSaveQuiz} className="mt-5 space-y-4">
            <label className={labelClass}>
              Quiz title *
              <input
                className={inputClass}
                required
                value={quizForm.title}
                onChange={(e) =>
                  setQuizForm({ ...quizForm, title: e.target.value })
                }
              />
            </label>

            <label className={labelClass}>
              Question *
              <textarea
                className={inputClass}
                required
                value={quizForm.question}
                onChange={(e) =>
                  setQuizForm({ ...quizForm, question: e.target.value })
                }
              />
            </label>

            {quizForm.options.map((option, index) => (
              <label className={labelClass} key={index}>
                Option {index + 1} *
                <input
                  className={inputClass}
                  required
                  value={option}
                  onChange={(e) =>
                    setQuizForm((previous) => ({
                      ...previous,
                      options: previous.options.map((item, i) =>
                        i === index ? e.target.value : item
                      ),
                    }))
                  }
                />
              </label>
            ))}

            <label className={labelClass}>
              Correct answer *
              <select
                className={inputClass}
                value={quizForm.correctAnswer}
                onChange={(e) =>
                  setQuizForm({
                    ...quizForm,
                    correctAnswer: e.target.value,
                  })
                }
              >
                {quizForm.options.map((option, index) => (
                  <option key={index} value={index}>
                    Option {index + 1}{option ? `: ${option}` : ""}
                  </option>
                ))}
              </select>
            </label>

            <p className="text-xs text-slate-400">
              Select the course and lesson in the AI Quiz section above.
              The correct answer is saved as a zero-based index.
            </p>

            <button
              className={buttonClass}
              type="submit"
              disabled={loading || !selectedCourse || !selectedLesson}
            >
              Save Quiz
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default InstructorDashboard;
