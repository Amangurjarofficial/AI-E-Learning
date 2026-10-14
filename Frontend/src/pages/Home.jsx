
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="mx-auto flex min-h-[85vh] max-w-6xl flex-col items-center justify-center px-6 py-20 text-center">
        <p className="mb-5 rounded-full border border-cyan-800 bg-cyan-950 px-4 py-2 text-sm text-cyan-300">
          AI-powered learning for everyone
        </p>

        <h1 className="max-w-4xl text-4xl font-extrabold leading-tight sm:text-6xl">
          Learn Smarter with{" "}
          <span className="text-cyan-400">LearnAI</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
          Explore courses, learn with an AI tutor, generate personalized
          quizzes, and track your learning journey in one place.
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-4">
          <Link
            to="/register"
            className="rounded-xl bg-cyan-500 px-7 py-3 font-bold text-slate-950 hover:bg-cyan-400"
          >
            Start Learning
          </Link>

          <Link
            to="/login"
            className="rounded-xl border border-slate-700 px-7 py-3 font-semibold hover:border-cyan-400"
          >
            Sign In
          </Link>
        </div>

        <div className="mt-20 grid w-full gap-5 text-left sm:grid-cols-3">
          {[
            {
              title: "Interactive Courses",
              description: "Access structured courses and lessons.",
            },
            {
              title: "AI Tutor",
              description: "Ask questions and get AI-generated explanations.",
            },
            {
              title: "Smart Quizzes",
              description: "Practice your knowledge with generated quizzes.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
            >
              <h2 className="text-xl font-bold text-cyan-400">
                {feature.title}
              </h2>
              <p className="mt-3 leading-7 text-slate-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Home;
