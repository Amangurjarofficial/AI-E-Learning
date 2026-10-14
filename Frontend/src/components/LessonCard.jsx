
function LessonCard({ lesson, index, onClick, isCompleted = false }) {
  if (!lesson) return null;

  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow-md">
      {/* Lesson Number / Icon */}
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
        {isCompleted ? (
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          <span className="text-lg font-bold">{index + 1}</span>
        )}
      </div>

      {/* Lesson Information */}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-base font-semibold text-gray-800">
          {lesson.title || `Lesson ${index + 1}`}
        </h3>

        <p className="mt-1 line-clamp-2 text-sm text-gray-500">
          {lesson.description || "Learn something new in this lesson."}
        </p>

        {lesson.duration && (
          <p className="mt-2 text-xs font-medium text-gray-400">
            Duration: {lesson.duration}
          </p>
        )}
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={onClick}
        disabled={!onClick}
        className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {isCompleted ? "Review" : "Start"}
      </button>
    </div>
  );
}

export default LessonCard;
