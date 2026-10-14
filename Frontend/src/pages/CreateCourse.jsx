import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import courseService from "../services/courseService";

function CreateCourse() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: "0",
    thumbnail: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.category.trim()
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (
      !Number.isFinite(Number(formData.price)) ||
      Number(formData.price) < 0
    ) {
      setError("Please enter a valid, non-negative course price.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category.trim(),
        price: Number(formData.price),
        thumbnail: formData.thumbnail.trim(),
      };

      await courseService.createCourse(payload);

      setSuccess("Course created successfully!");

      setTimeout(() => {
        navigate("/instructor/my-courses");
      }, 1000);
    } catch (err) {
      console.error("Create course error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to create course. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-4xl px-6 py-10">
        <Link
          to="/instructor"
          className="text-sm text-cyan-400 transition hover:text-cyan-300"
        >
          ← Back to Dashboard
        </Link>

        <div className="mb-8 mt-6">
          <h1 className="text-3xl font-bold md:text-4xl">
            Create a New Course
          </h1>

          <p className="mt-3 text-slate-400">
            Add your course details to start building your learning content.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl sm:p-8"
        >
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-800 bg-red-950/50 p-4 text-sm text-red-300"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              className="rounded-lg border border-emerald-800 bg-emerald-950/50 p-4 text-sm text-emerald-300"
            >
              {success}
            </div>
          )}

          <div>
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-semibold text-slate-200"
            >
              Course Title *
            </label>

            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Complete React Development"
              maxLength={120}
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-semibold text-slate-200"
            >
              Course Description *
            </label>

            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Explain what students will learn in this course..."
              rows={5}
              maxLength={5000}
              required
              className="w-full resize-y rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="mb-2 block text-sm font-semibold text-slate-200"
            >
              Category *
            </label>

            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            >
              <option value="">Select a category</option>
              <option value="Web Development">Web Development</option>
              <option value="Programming">Programming</option>
              <option value="Data Science">Data Science</option>
              <option value="Artificial Intelligence">
                Artificial Intelligence
              </option>
              <option value="Cloud Computing">Cloud Computing</option>
              <option value="Database">Database</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="price"
              className="mb-2 block text-sm font-semibold text-slate-200"
            >
              Course Price (₹)
            </label>

            <input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            />

            <p className="mt-2 text-xs text-slate-500">
              Enter 0 to make this course free.
            </p>
          </div>

          <div>
            <label
              htmlFor="thumbnail"
              className="mb-2 block text-sm font-semibold text-slate-200"
            >
              Thumbnail Image URL
            </label>

            <input
              id="thumbnail"
              name="thumbnail"
              type="url"
              value={formData.thumbnail}
              onChange={handleChange}
              placeholder="https://example.com/course-image.jpg"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            />

            {formData.thumbnail.trim() && (
              <div className="mt-4">
                <p className="mb-2 text-sm text-slate-400">
                  Thumbnail Preview
                </p>

                <img
                  src={formData.thumbnail}
                  alt="Course thumbnail preview"
                  className="h-48 w-full rounded-lg border border-slate-700 object-cover"
                  onError={(e) => {
                    e.currentTarget.style.visibility = "hidden";
                  }}
                  onLoad={(e) => {
                    e.currentTarget.style.visibility = "visible";
                  }}
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-800 pt-6 sm:flex-row">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating Course..." : "Create Course"}
            </button>

            <Link
              to="/instructor"
              className="rounded-lg border border-slate-700 px-5 py-3 text-center font-semibold text-slate-300 transition hover:bg-slate-800"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}

export default CreateCourse;