import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import aiService from "../services/aiService";
import enrollmentService from "../services/enrollmentService";

function AITutor() {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchEnrolledCourses = () =>
    enrollmentService
      .getMyEnrollments()
      .then((response) => {
        const enrollments = Array.isArray(response.enrollments)
          ? response.enrollments
          : [];
        const enrolledCourses = enrollments
          .map((enrollment) => enrollment.course)
          .filter((course) => course && course._id);

        setCourses(enrolledCourses);
        setCourseId((currentCourseId) =>
          enrolledCourses.some((course) => course._id === currentCourseId)
            ? currentCourseId
            : ""
        );
        setMessages([]);
      })
      .catch((err) => {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load your enrolled courses. Please try again."
        );
      })
      .finally(() => {
        setLoadingCourses(false);
      });

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const selectedCourse = courses.find((course) => course._id === courseId);

  const handleCourseChange = (e) => {
    setCourseId(e.target.value);
    setMessages([]);
    setError("");
  };

  const askQuestion = async (e) => {
    e.preventDefault();
    setError("");

    if (!courseId) {
      setError("Select a course before asking a question.");
      return;
    }

    if (!question.trim()) {
      setError("Enter a question for your AI tutor.");
      return;
    }

    try {
      setLoading(true);
      const response = await aiService.askCourseQuestion({
        courseId,
        question: question.trim(),
      });
      const answer =
        response?.answer || "The AI returned no answer. Please try again.";

      setMessages((previousMessages) => [
        ...previousMessages,
        { role: "student", content: question.trim() },
        { role: "tutor", content: answer },
      ]);
      setQuestion("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Could not contact the AI Tutor. Check your backend and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-4xl p-6 sm:p-10">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
            Your personal doubt solver
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">AI Tutor</h1>
          <p className="mt-3 text-slate-400">
            Choose one of your courses and ask questions about its lessons and
            topics.
          </p>
        </header>

        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 p-5 sm:p-6">
            <label
              htmlFor="tutor-course"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Choose a course
            </label>
            <select
              id="tutor-course"
              value={courseId}
              onChange={handleCourseChange}
              disabled={loadingCourses || loading || courses.length === 0}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white outline-none focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">
                {loadingCourses ? "Loading your courses..." : "Select a course"}
              </option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
            {selectedCourse && (
              <p className="mt-3 text-sm text-slate-400">
                Ask anything about{" "}
                <span className="font-medium text-cyan-300">
                  {selectedCourse.title}
                </span>
                . The tutor will use the course description and lesson details
                to help answer.
              </p>
            )}
          </div>

          {error && (
            <div
              role="alert"
              className="mx-5 mt-5 rounded-lg border border-red-500/30 bg-red-950/60 p-3 text-sm text-red-300 sm:mx-6"
            >
              {error}
              {loadingCourses && (
                <button
                  type="button"
                  onClick={() => {
                    setLoadingCourses(true);
                    setError("");
                    fetchEnrolledCourses();
                  }}
                  className="ml-3 font-semibold underline"
                >
                  Try again
                </button>
              )}
            </div>
          )}

          {!loadingCourses && !error && courses.length === 0 && (
            <div className="p-8 text-center">
              <h2 className="text-lg font-semibold">
                No enrolled courses yet
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Enroll in a course to ask the AI Tutor questions about it.
              </p>
              <Link
                to="/courses"
                className="mt-5 inline-block rounded-lg bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Browse courses
              </Link>
            </div>
          )}

          {courses.length > 0 && (
            <>
              <div
                aria-live="polite"
                className="max-h-[28rem] min-h-56 space-y-4 overflow-y-auto p-5 sm:p-6"
              >
                {!courseId ? (
                  <p className="pt-12 text-center text-slate-400">
                    Select a course above to start asking questions.
                  </p>
                ) : messages.length === 0 ? (
                  <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4 text-slate-300">
                    <p className="font-medium text-cyan-300">
                      Hi! I’m here to help with {selectedCourse?.title}.
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      Tell me what you’re stuck on, and I’ll explain it step by
                      step.
                    </p>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={`${message.role}-${index}`}
                      className={`flex ${
                        message.role === "student"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[90%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 sm:max-w-[80%] ${
                          message.role === "student"
                            ? "bg-cyan-500 text-slate-950"
                            : "border border-slate-700 bg-slate-950 text-slate-200"
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))
                )}
                {loading && (
                  <div className="text-sm text-cyan-300" role="status">
                    Your tutor is thinking...
                  </div>
                )}
              </div>

              <form
                onSubmit={askQuestion}
                className="border-t border-slate-800 p-5 sm:p-6"
              >
                <label htmlFor="tutor-question" className="sr-only">
                  Your question
                </label>
                <textarea
                  id="tutor-question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={
                    courseId
                      ? "What would you like help understanding?"
                      : "Select a course to get started"
                  }
                  rows={3}
                  maxLength={2000}
                  disabled={!courseId || loadingCourses || loading}
                  className="w-full resize-y rounded-lg border border-slate-700 bg-slate-950 p-3 outline-none focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                />
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-slate-500">
                    {question.length}/2000 characters
                  </p>
                  <button
                    type="submit"
                    disabled={!courseId || !question.trim() || loading}
                    className="rounded-lg bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? "Thinking..." : "Ask AI Tutor"}
                  </button>
                </div>
              </form>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default AITutor;
