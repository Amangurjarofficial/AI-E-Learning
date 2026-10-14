import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import authService from "../services/authService";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = new URLSearchParams(location.search).get("redirect");
  const loginUrl = redirect
    ? `/login?redirect=${encodeURIComponent(redirect)}`
    : "/login";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authService.register(form);

      navigate(loginUrl, {
        state: { message: "Account created successfully. Please log in." },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Registration failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="flex justify-center px-4 py-12">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md space-y-5 rounded-2xl border border-slate-800 bg-slate-900 p-8"
        >
          <h1 className="text-center text-3xl font-bold text-cyan-400">
            Create Account
          </h1>

          <p className="text-center text-slate-400">
            Join the LearnAI learning community.
          </p>

          {error && (
            <p role="alert" className="rounded-lg bg-red-950 p-3 text-red-300">
              {error}
            </p>
          )}

          <div>
            <label htmlFor="name" className="mb-2 block">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              required
              autoComplete="name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              minLength={8}
              required
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 outline-none focus:border-cyan-400"
            />
            <p className="mt-1 text-xs text-slate-500">
              Use at least 8 characters.
            </p>
          </div>

          <div>
            <label htmlFor="role" className="mb-2 block">
              Register as
            </label>
            <select
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3"
            >
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-cyan-500 p-3 font-bold text-slate-950 disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Register"}
          </button>

          <p className="text-center text-slate-400">
            Already have an account?{" "}
            <Link to={loginUrl} className="text-cyan-400">
              Login
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
}

export default Register;