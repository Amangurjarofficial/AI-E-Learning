import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import courseService from "../services/courseService";
import enrollmentService from "../services/enrollmentService";
import LessonCard from "../components/LessonCard";

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function CourseDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrolled, setEnrolled] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(true);
  const [enrollmentError, setEnrollmentError] = useState("");
  const [enrollmentMessage, setEnrollmentMessage] = useState("");
  const [enrolling, setEnrolling] = useState(false);
  const user = getStoredUser();
  const hasToken = Boolean(localStorage.getItem("token"));
  const isStudent = Boolean(hasToken && user?.role === "student");

  // Return to this course after login
  const loginUrl = `/login?redirect=${encodeURIComponent(
    location.pathname
  )}`;

  const fetchCourseDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await courseService.getCourseById(id);
      const courseData = data.course ?? data;

      setCourse(courseData);
      setLessons(
        Array.isArray(courseData.lessons) ? courseData.lessons : []
      );
    } catch (err) {
      console.error("Course details error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load course details."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCourseDetails();
  }, [fetchCourseDetails]);

  useEffect(() => {
    if (!isStudent) {
      return undefined;
    }

    let active = true;
    enrollmentService
      .getMyEnrollments()
      .then((response) => {
        if (!active) return;
        const enrollments = Array.isArray(response.enrollments)
          ? response.enrollments
          : [];
        setEnrolled(
          enrollments.some(
            (enrollment) =>
              String(enrollment.course?._id || enrollment.course) ===
              String(id)
          )
        );
      })
      .catch((err) => {
        if (!active) return;
        setEnrollmentError(
          err.response?.data?.message ||
            err.message ||
            "Unable to check your enrollment. Please try again."
        );
      })
      .finally(() => {
        if (active) setEnrollmentLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, isStudent]);

  const handleEnroll = async () => {
    if (!isStudent) {
      navigate(loginUrl);
      return;
    }

    setEnrollmentError("");
    setEnrollmentMessage("");
    setEnrolling(true);

    try {
      const response = await enrollmentService.enrollInCourse(id);
      setEnrolled(true);
      setEnrollmentMessage(
        response.message || "You are enrolled in this course for free."
      );
    } catch (err) {
      setEnrollmentError(
        err.response?.data?.message ||
          err.message ||
          "Unable to enroll in this course. Please try again."
      );
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="mt-4 text-gray-600">
            Loading course details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
        <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            Unable to Load Course
          </h2>

          <p className="mt-3 text-red-600">{error}</p>

          <button
            type="button"
            onClick={fetchCourseDetails}
            className="mt-5 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Try Again
          </button>

          <Link
            to="/courses"
            className="mt-4 block text-blue-600 hover:underline"
          >
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Course Not Found
        </h2>

        <Link
          to="/courses"
          className="mt-4 inline-block text-blue-600 hover:underline"
        >
          Back to Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-linear-to-r from-gray-900 to-blue-950 px-6 py-12 text-white">
        <div className="mx-auto max-w-6xl">
          <Link
            to="/courses"
            className="text-sm text-blue-300 transition hover:text-white"
          >
            ← Back to Courses
          </Link>

          {course.category && (
            <div className="mt-6">
              <span className="rounded-full bg-blue-500/20 px-3 py-1 text-sm font-medium text-blue-200">
                {course.category}
              </span>
            </div>
          )}

          <h1 className="mt-5 text-3xl font-bold md:text-5xl">
            {course.title || "Untitled Course"}
          </h1>

          <p className="mt-4 max-w-3xl leading-7 text-gray-300">
            {course.description || "No description available."}
          </p>

          <div className="mt-6 flex flex-wrap gap-5 text-sm text-gray-300">
            {course.level && (
              <span>
                <strong className="text-white">Level:</strong>{" "}
                {course.level}
              </span>
            )}

            {course.instructor?.name && (
              <span>
                <strong className="text-white">Instructor:</strong>{" "}
                {course.instructor.name}
              </span>
            )}

            <span>
              <strong className="text-white">Lessons:</strong>{" "}
              {lessons.length}
            </span>
          </div>
        </div>
      </section>

      <main className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-gray-900">
            Course Overview
          </h2>

          <p className="mt-3 whitespace-pre-line leading-7 text-gray-600">
            {course.description || "No course overview provided yet."}
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-bold text-gray-900">
              Course Curriculum
            </h2>

            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
              {lessons.length} lessons
            </span>
          </div>

          {lessons.length > 0 ? (
            <div className="mt-5 space-y-4">
              {lessons.map((lesson, index) => (
                <LessonCard
                  key={lesson._id || lesson.id || index}
                  lesson={lesson}
                  index={index}
                  onClick={() => {
                    console.log("Selected lesson:", lesson);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
              <h3 className="text-lg font-semibold text-gray-800">
                No Lessons Available
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                The instructor has not added any lessons to this course yet.
              </p>
            </div>
          )}
        </section>

        <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <img
            src={course.thumbnail || "/course-placeholder.svg"}
            alt={course.title || "Course thumbnail"}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/course-placeholder.svg";
            }}
            className="mb-5 h-44 w-full rounded-xl bg-slate-100 object-cover"
          />

          <h2 className="text-xl font-bold text-gray-900">
            Course Information
          </h2>

          <div className="mt-5 divide-y divide-gray-100">
            <div className="flex justify-between gap-3 py-3">
              <span className="text-gray-500">Price</span>

              <span className="font-semibold text-gray-900">
                Free
              </span>
            </div>

            <div className="flex justify-between gap-3 py-3">
              <span className="text-gray-500">Category</span>

              <span className="text-right font-medium text-gray-900">
                {course.category || "General"}
              </span>
            </div>

            <div className="flex justify-between gap-3 py-3">
              <span className="text-gray-500">Level</span>

              <span className="font-medium text-gray-900">
                {course.level || "All levels"}
              </span>
            </div>

            <div className="flex justify-between gap-3 py-3">
              <span className="text-gray-500">Total lessons</span>

              <span className="font-medium text-gray-900">
                {lessons.length}
              </span>
            </div>
          </div>

          {enrollmentError && (
            <p
              role="alert"
              className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {enrollmentError}
            </p>
          )}

          {enrollmentMessage && (
            <p
              role="status"
              className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700"
            >
              {enrollmentMessage}
            </p>
          )}

          {enrolled ? (
            <div className="mt-6 rounded-xl bg-emerald-50 px-5 py-3 text-center font-semibold text-emerald-700">
              You are enrolled in this course
            </div>
          ) : isStudent ? (
            <button
              type="button"
              onClick={handleEnroll}
              disabled={enrollmentLoading || enrolling}
              className="mt-6 block w-full rounded-xl bg-blue-600 px-5 py-3 text-center font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {enrollmentLoading
                ? "Checking enrollment..."
                : enrolling
                  ? "Enrolling..."
                  : "Enroll for Free"}
            </button>
          ) : (
              <button
                type="button"
                onClick={() => navigate(loginUrl)}
                className="mt-6 block w-full rounded-xl bg-blue-600 px-5 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
              >
                Enroll for Free
              </button>
            )}

          {!isStudent && !enrolled && (
            <p className="mt-3 text-center text-xs leading-5 text-gray-500">
              {hasToken
                ? "A student account is required to enroll in this course."
                : "Sign in as a student to enroll in this course."}
            </p>
          )}
        </aside>
      </main>
    </div>
  );
}

export default CourseDetails;