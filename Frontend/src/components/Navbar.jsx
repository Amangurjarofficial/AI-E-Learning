
import { Link, useNavigate } from "react-router-dom";

function getStoredUser() {
  try {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) return null;

    const parsedUser = JSON.parse(storedUser);

    if (
      typeof parsedUser === "object" &&
      parsedUser !== null &&
      typeof parsedUser.role === "string"
    ) {
      return parsedUser;
    }

    return null;
  } catch {
    return null;
  }
}

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = getStoredUser();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 bg-slate-950 px-6 py-4 text-white">
      <Link to="/" className="text-2xl font-bold text-cyan-400">
        LearnAI
      </Link>

      <div className="flex flex-wrap items-center gap-4">
        <Link
          to="/"
          className="text-slate-300 hover:text-cyan-400"
        >
          Home
        </Link>

        {token && user ? (
          <>
            <Link
              to={`/${user.role}`}
              className="text-slate-300 hover:text-cyan-400"
            >
              Dashboard
            </Link>

            <span className="text-sm text-slate-400">
              {user.name || user.email || "User"}
            </span>

            <button
              type="button"
              onClick={logout}
              className="rounded-lg bg-red-500 px-4 py-2 font-semibold text-white hover:bg-red-600"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="text-slate-300 hover:text-cyan-400"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-400"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
