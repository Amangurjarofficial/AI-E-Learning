import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import authService from "../services/authService";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const redirect = params.get("redirect");
  const registerUrl = redirect
    ? `/register?redirect=${encodeURIComponent(redirect)}`
    : "/register";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await authService.login(form);

      const token = data.token || data.accessToken;
      const user = data.user;

      if (!token || !user) {
        throw new Error(
          "Login response is missing a token or user. Check authController.js."
        );
      }

      // Read the destination requested before login.
      // Only allow safe internal paths.
      if (
        redirect &&
        redirect.startsWith("/") &&
        !redirect.startsWith("//")
      ) {
        navigate(redirect, { replace: true });
        return;
      }

      // Use the role dashboard when no redirect was requested.
      if (user.role === "admin") {
        navigate("/admin", { replace: true });
      } else if (user.role === "instructor") {
        navigate("/instructor", { replace: true });
      } else if (user.role === "student") {
        navigate("/student", { replace: true });
      } else {
        throw new Error("Your account has an unrecognized role.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Login failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="flex justify-center px-4 py-16">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md space-y-5 rounded-2xl border border-slate-800 bg-slate-900 p-8"
        >
          <h1 className="text-center text-3xl font-bold text-cyan-400">
            Welcome Back
          </h1>

          <p className="text-center text-slate-400">
            Sign in to your LearnAI account.
          </p>

          {location.state?.message && (
            <p className="rounded-lg bg-emerald-950 p-3 text-emerald-300">
              {location.state.message}
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-950 p-3 text-red-300"
            >
              {error}
            </p>
          )}

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
              required
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 outline-none focus:border-cyan-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-cyan-500 p-3 font-bold text-slate-950 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center text-slate-400">
            Don't have an account?{" "}
            <Link to={registerUrl} className="text-cyan-400">
              Register
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
}

export default Login;