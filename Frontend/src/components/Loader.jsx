function Loader({ message = "Loading..." }) {
  return (
    <div
      className="flex min-h-[40vh] flex-col items-center justify-center px-4 py-12"
      role="status"
      aria-live="polite"
    >
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500"></div>

      <p className="mt-4 text-sm font-medium text-slate-400">
        {message}
      </p>

      <span className="sr-only">Please wait</span>
    </div>
  );
}

export default Loader;