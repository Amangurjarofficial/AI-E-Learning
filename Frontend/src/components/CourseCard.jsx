
import { Link } from "react-router-dom";

function CourseCard({ course }) {
  if (!course) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Course Thumbnail */}
      <img
        src={
          course.thumbnail ||
          "/course-placeholder.svg"
        }
        alt={course.title || "Course"}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = "/course-placeholder.svg";
        }}
        className="h-48 w-full bg-gray-100 object-cover"
      />

      {/* Course Details */}
      <div className="p-5">
        <span className="mb-3 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
          {course.category || "General"}
        </span>

        <h3 className="mb-2 text-xl font-bold text-gray-800">
          {course.title || "Untitled Course"}
        </h3>

        <p className="mb-5 line-clamp-2 text-sm leading-6 text-gray-600">
          {course.description || "No description available."}
        </p>

        {/* Price and Button */}
        <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
          <span className="text-lg font-bold text-gray-900">
            Free
          </span>

          <Link
            to={`/courses/${course._id}`}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            View Course
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CourseCard;