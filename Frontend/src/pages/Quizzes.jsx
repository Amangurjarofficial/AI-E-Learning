import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import enrollmentService from "../services/enrollmentService";
import quizService from "../services/quizService";

function Quizzes() {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [quizzes, setQuizzes] = useState([]);
  const [quizId, setQuizId] = useState("");
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    enrollmentService
      .getMyEnrollments()
      .then((response) => {
        const enrollments = Array.isArray(response.enrollments)
          ? response.enrollments
          : [];
        setCourses(
          enrollments
            .map((enrollment) => enrollment.course)
            .filter((course) => course && course._id)
        );
      })
      .catch((err) => {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load your enrolled courses. Please try again."
        );
      })
      .finally(() => setLoadingCourses(false));
  }, []);

  const loadCourseQuizzes = async (selectedCourseId) => {
    setCourseId(selectedCourseId);
    setQuizzes([]);
    setQuizId("");
    setQuiz(null);
    setAnswers({});
    setResult(null);
    setError("");

    if (!selectedCourseId) return;

    try {
      setLoadingQuizzes(true);
      const response = await quizService.getQuizzesByCourse(selectedCourseId);
      setQuizzes(Array.isArray(response.quizzes) ? response.quizzes : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load quizzes for this course. Please try again."
      );
    } finally {
      setLoadingQuizzes(false);
    }
  };

  const loadQuiz = async (selectedQuizId) => {
    setQuizId(selectedQuizId);
    setQuiz(null);
    setAnswers({});
    setResult(null);
    setError("");

    if (!selectedQuizId) return;

    try {
      setLoading(true);
      const response = await quizService.getQuizById(selectedQuizId);
      const loadedQuiz = response?.quiz ?? response;

      if (!loadedQuiz || !Array.isArray(loadedQuiz.questions)) {
        throw new Error("Invalid quiz response. The quiz must contain questions.");
      }

      if (loadedQuiz.questions.length === 0) {
        throw new Error("This quiz does not contain any questions.");
      }

      const validQuestions = loadedQuiz.questions.every(
        (question) =>
          question &&
          typeof question.questionText === "string" &&
          Array.isArray(question.options) &&
          question.options.length === 4
      );

      if (!validQuestions) {
        throw new Error(
          "Some questions are missing their question text or options."
        );
      }

      setQuiz(loadedQuiz);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load this quiz. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex, optionIndex) => {
    setAnswers((previous) => ({
      ...previous,
      [questionIndex]: optionIndex,
    }));
    setError("");
  };

  const submitQuiz = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!quiz) {
      setError("Choose a quiz first.");
      return;
    }

    const unansweredIndex = quiz.questions.findIndex(
      (_, index) => answers[index] === undefined
    );

    if (unansweredIndex !== -1) {
      setError(
        `Please answer question ${unansweredIndex + 1} before submitting.`
      );
      return;
    }

    try {
      setLoading(true);
      const response = await quizService.submitQuiz(
        quizId,
        quiz.questions.map((_, index) => answers[index])
      );
      setResult(response.result ?? response);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to submit the quiz. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetQuiz = () => {
    setQuizId("");
    setQuiz(null);
    setAnswers({});
    setResult(null);
    setError("");
  };

  const getOptionLabel = (option, index) => {
    if (typeof option === "string") return option;
    if (option && typeof option === "object") {
      return (
        option.text ||
        option.label ||
        option.option ||
        `Option ${index + 1}`
      );
    }
    return `Option ${index + 1}`;
  };

  const answeredCount = quiz
    ? quiz.questions.filter((_, index) => answers[index] !== undefined).length
    : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-3xl p-6 sm:p-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-cyan-400">
            Practice Quizzes
          </h1>
          <p className="mt-3 text-slate-400">
            Choose one of your enrolled courses to see its quizzes.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-red-800 bg-red-950 p-4 text-red-300"
          >
            {error}
          </div>
        )}

        <section className="space-y-5 rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div>
            <label
              htmlFor="quiz-course"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Enrolled course
            </label>
            <select
              id="quiz-course"
              value={courseId}
              onChange={(e) => loadCourseQuizzes(e.target.value)}
              disabled={loadingCourses || loadingQuizzes || courses.length === 0}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white outline-none focus:border-cyan-400 disabled:opacity-60"
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
          </div>

          {!loadingCourses && courses.length === 0 && (
            <p className="text-sm text-slate-400">
              You have not enrolled in any courses yet. Enroll in a course to
              access its quizzes.
            </p>
          )}

          {courseId && (
            <div>
              <label
                htmlFor="available-quiz"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Available quizzes
              </label>
              <select
                id="available-quiz"
                value={quizId}
                onChange={(e) => loadQuiz(e.target.value)}
                disabled={loadingQuizzes || loading || quizzes.length === 0}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white outline-none focus:border-cyan-400 disabled:opacity-60"
              >
                <option value="">
                  {loadingQuizzes
                    ? "Loading quizzes..."
                    : quizzes.length
                      ? "Select a quiz"
                      : "No quizzes available for this course"}
                </option>
                {quizzes.map((availableQuiz) => (
                  <option key={availableQuiz._id} value={availableQuiz._id}>
                    {availableQuiz.title}
                    {availableQuiz.lesson?.title
                      ? ` - ${availableQuiz.lesson.title}`
                      : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {courseId && !loadingQuizzes && quizzes.length === 0 && !error && (
            <p className="text-sm text-slate-400">
              There are no quizzes for this course yet.
            </p>
          )}
        </section>

        {loading && !quiz && (
          <p className="mt-6 text-sm text-cyan-300" role="status">
            Loading quiz...
          </p>
        )}

        {quiz && !result && (
          <form onSubmit={submitQuiz} className="mt-8 space-y-6">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="text-2xl font-semibold text-cyan-400">
                  {quiz.title || "Your Quiz"}
                </h2>
                <button
                  type="button"
                  onClick={resetQuiz}
                  disabled={loading}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold transition hover:bg-slate-800 disabled:opacity-50"
                >
                  Change Quiz
                </button>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 text-sm text-slate-400">
                <span>Total questions: {quiz.questions.length}</span>
                <span>
                  Answered: {answeredCount} / {quiz.questions.length}
                </span>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-cyan-500 transition-all duration-300"
                  style={{
                    width: `${(answeredCount / quiz.questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {quiz.questions.map((question, questionIndex) => (
              <section
                key={question._id || questionIndex}
                className="rounded-xl border border-slate-800 bg-slate-900 p-5"
              >
                <h3 className="font-semibold leading-relaxed">
                  {questionIndex + 1}. {question.questionText}
                </h3>

                <div className="mt-4 space-y-3">
                  {question.options.map((option, optionIndex) => (
                    <label
                      key={optionIndex}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${
                        answers[questionIndex] === optionIndex
                          ? "border-cyan-400 bg-cyan-950"
                          : "border-slate-700 hover:border-cyan-500"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${questionIndex}`}
                        value={optionIndex}
                        checked={answers[questionIndex] === optionIndex}
                        onChange={() =>
                          handleAnswerChange(questionIndex, optionIndex)
                        }
                        disabled={loading}
                        required
                        className="accent-cyan-400"
                      />
                      <span className="text-slate-200">
                        {getOptionLabel(option, optionIndex)}
                      </span>
                    </label>
                  ))}
                </div>
              </section>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {loading ? "Submitting..." : "Submit Quiz"}
            </button>
          </form>
        )}

        {result && (
          <section
            aria-live="polite"
            className="mt-8 rounded-xl border border-cyan-800 bg-slate-900 p-6"
          >
            <h2 className="text-2xl font-bold text-cyan-400">Quiz Result</h2>
            {typeof result.score === "number" && (
              <p className="mt-4 text-lg">
                Score:{" "}
                <span className="font-bold text-white">
                  {result.score}
                  {typeof result.total === "number" ? ` / ${result.total}` : ""}
                </span>
              </p>
            )}
            {typeof result.percentage === "number" && (
              <p className="mt-2 text-lg">
                Percentage:{" "}
                <span className="font-bold text-white">
                  {result.percentage}%
                </span>
              </p>
            )}
            {result.message && (
              <p className="mt-3 text-slate-300">{result.message}</p>
            )}
            <details className="mt-5">
              <summary className="cursor-pointer text-sm text-cyan-400 hover:text-cyan-300">
                View complete result data
              </summary>
              <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words rounded-lg bg-slate-950 p-4 text-sm text-slate-300">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
            <button
              type="button"
              onClick={resetQuiz}
              className="mt-6 rounded-lg bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Try Another Quiz
            </button>
          </section>
        )}
      </main>
    </div>
  );
}

export default Quizzes;
