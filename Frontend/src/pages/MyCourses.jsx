import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
import courseService from "../services/courseService";

function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchMyCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await courseService.getMyCourses();
      const data = response.courses
        ? response
        : response.data ?? response;

      setCourses(
        Array.isArray(data)
          ? data
          : Array.isArray(data.courses)
            ? data.courses
            : Array.isArray(data.data)
              ? data.data
              : []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load your courses. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyCourses();
  }, [fetchMyCourses]);

  const handleDelete = async (courseId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this course? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setDeletingId(courseId);
      setError("");

      await courseService.deleteCourse(courseId);

      setCourses((previousCourses) =>
        previousCourses.filter((course) => course._id !== courseId)
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete this course. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">
              My Courses
            </h1>
            <p className="mt-2 text-slate-400">
              View and manage the courses you have created.
            </p>
          </div>

          <Link
            to="/instructor/courses/create"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-500"
          >
            + Create Course
          </Link>
        </div>

        {error && (
          <div className="mb-6 flex flex-col gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-300 sm:flex-row sm:items-center sm:justify-between">
            <p>{error}</p>
            <button
              type="button"
              onClick={fetchMyCourses}
              className="self-start rounded-lg border border-red-400/30 px-4 py-2 hover:bg-red-500/10 sm:self-auto"
            >
              Try Again
            </button>
          </div>
        )}

        <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Total courses</p>
          <p className="mt-1 text-3xl font-bold text-blue-400">
            {courses.length}
          </p>
        </div>

        {courses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 px-6 py-16 text-center">
            <div className="mb-4 text-5xl">📚</div>
            <h2 className="text-xl font-semibold">
              You haven't created any courses yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-slate-400">
              Create your first course and start sharing your knowledge with students.
            </p>
            <Link
              to="/instructor/courses/create"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500"
            >
              Create Your First Course
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <article
                key={course._id}
                className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 transition hover:border-slate-700"
              >
                <img
                  src={
                    course.thumbnail ||
                    "/course-placeholder.svg"
                  }
                  alt={course.title || "Course thumbnail"}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/course-placeholder.svg";
                  }}
                  className="h-48 w-full bg-slate-800 object-cover"
                />

                <div className="p-5">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
                      {course.category || "General"}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        course.isPublished
                          ? "bg-green-500/10 text-green-400"
                          : "bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      {course.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>

                  <h2 className="text-xl font-semibold">
                    {course.title || "Untitled Course"}
                  </h2>

                  <p className="mt-2 line-clamp-3 min-h-18 text-sm leading-6 text-slate-400">
                    {course.description || "No description available."}
                  </p>

                  <p className="mt-4 text-lg font-bold text-white">
                    {Number(course.price) === 0
                      ? "Free"
                      : `₹${course.price}`}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <Link
                      to={`/instructor/courses/edit/${course._id}`}
                      className="rounded-lg border border-slate-700 px-3 py-2 text-center text-sm font-medium transition hover:bg-slate-800"
                    >
                      Edit Course
                    </Link>

                    <Link
                      to={`/instructor/courses/${course._id}/lessons`}
                      className="rounded-lg bg-blue-600 px-3 py-2 text-center text-sm font-medium transition hover:bg-blue-500"
                    >
                      Manage Lessons
                    </Link>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(course._id)}
                    disabled={Boolean(deletingId)}
                    className="mt-3 w-full rounded-lg border border-red-500/30 px-3 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingId === course._id
                      ? "Deleting..."
                      : "Delete Course"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default MyCourses;