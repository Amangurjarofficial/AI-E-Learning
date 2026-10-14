
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function StudentDashboard() {
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  const features = [
    {
      title: "Browse Courses",
      description: "Explore available courses and start learning new skills.",
      link: "/courses",
      button: "Explore Courses",
    },
    {
      title: "AI Tutor",
      description: "Get help understanding lessons with your AI learning assistant.",
      link: "/ai-tutor",
      button: "Open AI Tutor",
    },
    {
      title: "Practice Quizzes",
      description: "Test your knowledge and strengthen your understanding.",
      link: "/quizzes",
      button: "Practice Now",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-6xl p-6 sm:p-10">
        <h1 className="text-3xl font-bold">
          Welcome,{" "}
          <span className="text-cyan-400">
            {user?.name || "Student"}
          </span>
        </h1>

        <p className="mt-3 text-slate-400">
          Continue learning and improve your skills.
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((item) => (
            <section
              key={item.title}
              className="flex flex-col rounded-xl border border-slate-800 bg-slate-900 p-6 transition hover:border-cyan-500"
            >
              <h2 className="text-xl font-semibold text-cyan-400">
                {item.title}
              </h2>

              <p className="mt-3 flex-1 text-slate-400">
                {item.description}
              </p>

              <Link
                to={item.link}
                className="mt-6 inline-block self-start rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-400"
              >
                {item.button} →
              </Link>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}

export default StudentDashboard;
