import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
import progressService from "../services/progressService";

function MyProgress() {
  const [progressList, setProgressList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProgress = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await progressService.getMyProgress();

      const data = Array.isArray(response)
        ? response
        : response.progress ??
          response.progressList ??
          response.data ??
          [];

      setProgressList(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load your learning progress. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const getCourse = (item) => item.course || item;

  const getCompletedLessons = (item) => {
    const completed =
      item.completedLessons ??
      item.completedLessonIds ??
      [];

    if (Array.isArray(completed)) {
      return completed.length;
    }

    return Number(completed) || 0;
  };

  const getTotalLessons = (item) => {
    const course = getCourse(item);

    return (
      Number(item.totalLessons) ||
      (Array.isArray(course?.lessons)
        ? course.lessons.length
        : 0)
    );
  };

  const getPercentage = (item) => {
    const explicitPercentage =
      item.progressPercentage ?? item.progress;

    if (
      typeof explicitPercentage === "number" &&
      Number.isFinite(explicitPercentage)
    ) {
      return Math.round(
        Math.min(100, Math.max(0, explicitPercentage))
      );
    }

    const total = getTotalLessons(item);

    if (total === 0) return 0;

    return Math.round(
      Math.min(
        100,
        (getCompletedLessons(item) / total) * 100
      )
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        <Loader />
      </div>
    );
  }

  const completedCourses = progressList.filter(
    (item) => getPercentage(item) === 100
  ).length;

  const averageProgress =
    progressList.length > 0
      ? Math.round(
          progressList.reduce(
            (sum, item) => sum + getPercentage(item),
            0
          ) / progressList.length
        )
      : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold sm:text-4xl">
            My Learning Progress
          </h1>
          <p className="mt-2 text-slate-400">
            Track your courses and see how far you've progressed.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            <p>{error}</p>
            <button
              type="button"
              onClick={fetchProgress}
              className="mt-3 rounded-lg border border-red-400/30 px-4 py-2 hover:bg-red-500/10"
            >
              Try Again
            </button>
          </div>
        )}

        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Enrolled Courses
            </p>
            <p className="mt-2 text-3xl font-bold">
              {progressList.length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Completed Courses
            </p>
            <p className="mt-2 text-3xl font-bold text-green-400">
              {completedCourses}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Average Progress
            </p>
            <p className="mt-2 text-3xl font-bold text-blue-400">
              {averageProgress}%
            </p>
          </div>
        </div>

        {progressList.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 px-6 py-16 text-center">
            <div className="mb-4 text-5xl">🎯</div>
            <h2 className="text-xl font-semibold">
              Your learning journey starts here
            </h2>
            <p className="mx-auto mt-2 max-w-md text-slate-400">
              Enroll in a course to begin tracking your progress.
            </p>
            <Link
              to="/courses"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500"
            >
              Explore Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {progressList.map((item, index) => {
              const course = getCourse(item);

              const courseId =
                typeof course === "object"
                  ? course?._id
                  : course;

              const percentage = getPercentage(item);
              const completed = getCompletedLessons(item);
              const total = getTotalLessons(item);

              return (
                <article
                  key={item._id || courseId || index}
                  className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900"
                >
                  <img
                    src={
                      course?.thumbnail ||
                      "/course-placeholder.svg"
                    }
                    alt={course?.title || "Course thumbnail"}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/course-placeholder.svg";
                    }}
                    className="h-48 w-full bg-slate-800 object-cover"
                  />

                  <div className="p-5">
                    <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
                      {course?.category || "Course"}
                    </span>

                    <h2 className="mt-3 text-xl font-semibold">
                      {course?.title || "Untitled Course"}
                    </h2>

                    <div className="mt-6 flex items-center justify-between text-sm">
                      <span className="text-slate-400">
                        Course Progress
                      </span>
                      <span className="font-semibold text-blue-400">
                        {percentage}%
                      </span>
                    </div>

                    <div
                      className="mt-3 h-3 overflow-hidden rounded-full bg-slate-800"
                      role="progressbar"
                      aria-valuenow={percentage}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label="Course progress"
                    >
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <div className="mt-3 flex justify-between gap-3 text-xs text-slate-400">
                      <span>{completed} lessons completed</span>
                      <span>
                        {total > 0
                          ? `${total} total lessons`
                          : "Total lessons unavailable"}
                      </span>
                    </div>

                    <div className="mt-6">
                      {courseId ? (
                        <Link
                          to={`/courses/${courseId}`}
                          className="block rounded-lg bg-blue-600 px-4 py-3 text-center font-semibold transition hover:bg-blue-500"
                        >
                          {percentage === 100
                            ? "Review Course"
                            : "Continue Learning"}
                        </Link>
                      ) : (
                        <p className="text-sm text-slate-500">
                          Course details are unavailable.
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default MyProgress;