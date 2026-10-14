function ErrorMessage({
  message = "Something went wrong. Please try again.",
  onRetry,
}) {
  return (
    <div
      className="mx-auto my-6 w-full max-w-2xl rounded-xl border border-red-500/30 bg-red-500/10 p-5"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-xl text-red-400">
          !
        </div>

        <div className="flex-1">
          <h2 className="font-semibold text-red-400">
            Unable to load data
          </h2>

          <p className="mt-2 break-words text-sm leading-6 text-red-300">
            {message}
          </p>

          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 rounded-lg bg-red-500/15 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/25 focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ErrorMessage;