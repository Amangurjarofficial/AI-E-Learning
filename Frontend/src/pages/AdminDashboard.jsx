
import Navbar from "../components/Navbar";

function AdminDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="mx-auto max-w-6xl p-6 sm:p-10">
        <h1 className="text-3xl font-bold text-cyan-400">
          Admin Dashboard
        </h1>
        <p className="mt-3 text-slate-400">
          Welcome, {user?.name || "Admin"}.
        </p>

        <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Platform Management</h2>
          <p className="mt-3 text-slate-400">
            User and platform management features will be added here.
          </p>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
