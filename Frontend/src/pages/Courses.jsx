import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import CourseCard from "../components/CourseCard";
import courseService from "../services/courseService";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await courseService.getAllCourses();

      const courseList = Array.isArray(data)
        ? data
        : Array.isArray(data.courses)
          ? data.courses
          : Array.isArray(data.data)
            ? data.data
            : [];

      setCourses(courseList);
    } catch (err) {
      console.error("Fetch courses error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load courses. Please check your backend connection."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Explore Courses
            </h1>

            <p className="mt-3 text-slate-400">
              Discover new skills and learn at your own pace.
            </p>
          </div>

          {!loading && !error && (
            <span className="w-fit rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300">
              {courses.length} courses available
            </span>
          )}
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />

            <p className="mt-4 text-slate-400">
              Loading courses...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-900 bg-red-950/50 p-6">
            <h2 className="text-lg font-semibold text-red-300">
              Something went wrong
            </h2>

            <p className="mt-2 text-sm text-red-200">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchCourses}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && courses.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 px-6 py-16 text-center">
            <h2 className="text-xl font-semibold text-white">
              No Courses Available
            </h2>

            <p className="mx-auto mt-3 max-w-md text-slate-400">
              There are no published courses yet. Check back later
              when instructors add new courses.
            </p>

            <Link
              to="/"
              className="mt-6 inline-block rounded-lg bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Back to Home
            </Link>
          </div>
        )}

        {!loading && !error && courses.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard
                key={course._id || course.id}
                course={course}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Courses;