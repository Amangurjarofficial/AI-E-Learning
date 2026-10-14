import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="flex min-h-[75vh] items-center justify-center px-4 py-16">
        <div className="w-full max-w-xl text-center">
          <p className="text-8xl font-extrabold tracking-tight text-blue-500 sm:text-9xl">
            404
          </p>

          <div className="mx-auto mt-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 text-4xl">
            🔍
          </div>

          <h1 className="mt-6 text-3xl font-bold sm:text-4xl">
            Page Not Found
          </h1>

          <p className="mx-auto mt-4 max-w-md leading-7 text-slate-400">
            Sorry, the page you're looking for doesn't exist or may have been moved.
            Let's get you back to learning.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/"
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
            >
              Go to Home
            </Link>

            <Link
              to="/courses"
              className="rounded-lg border border-slate-700 px-6 py-3 font-semibold text-slate-300 transition hover:bg-slate-900"
            >
              Explore Courses
            </Link>
          </div>

          <p className="mt-8 text-sm text-slate-500">
            Error code: 404 — Route not found
          </p>
        </div>
      </main>
    </div>
  );
}

export default NotFound;