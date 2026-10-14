import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import courseService from "../services/courseService";

function EditCourse() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: "0",
    thumbnail: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchCourse = useCallback(async () => {
    if (!id) {
      setError("Course ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await courseService.getCourseById(id);
      const course = data.course ?? data;

      setFormData({
        title: course.title || "",
        description: course.description || "",
        category: course.category || "",
        price: String(course.price ?? 0),
        thumbnail: course.thumbnail || "",
      });
    } catch (err) {
      console.error("Fetch course error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load course details."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

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
      setError("Please complete all required fields.");
      return;
    }

    const price = Number(formData.price);

    if (!Number.isFinite(price) || price < 0) {
      setError("Enter a valid, non-negative course price.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category.trim(),
        price,
        thumbnail: formData.thumbnail.trim(),
      };

      await courseService.updateCourse(id, payload);

      setSuccess("Course updated successfully!");

      setTimeout(() => {
        navigate("/instructor/my-courses");
      }, 1000);
    } catch (err) {
      console.error("Update course error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update course. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />

        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />

            <p className="mt-4 text-slate-400">
              Loading course details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />

        <div className="mx-auto max-w-2xl px-6 py-16">
          <div className="rounded-xl border border-red-900 bg-red-950/40 p-6">
            <h2 className="text-xl font-bold">
              Unable to Load Course
            </h2>

            <p className="mt-3 text-red-300">{error}</p>

            <button
              type="button"
              onClick={fetchCourse}
              className="mt-5 rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-400"
            >
              Try Again
            </button>

            <Link
              to="/instructor/my-courses"
              className="ml-4 inline-block text-cyan-400 hover:underline"
            >
              Back to My Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-4xl px-6 py-10">
        <Link
          to="/instructor/my-courses"
          className="text-sm text-cyan-400 hover:text-cyan-300"
        >
          ← Back to My Courses
        </Link>

        <div className="mb-8 mt-6">
          <h1 className="text-3xl font-bold md:text-4xl">
            Edit Course
          </h1>

          <p className="mt-3 text-slate-400">
            Update your course information and save your changes.
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
              value={formData.title}
              onChange={handleChange}
              maxLength={120}
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
              placeholder="Enter course title"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-semibold text-slate-200"
            >
              Description *
            </label>

            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              maxLength={5000}
              required
              className="w-full resize-y rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
              placeholder="Describe what students will learn"
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
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
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
              Price (₹)
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
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
            />

            <p className="mt-2 text-xs text-slate-500">
              Set the price to 0 for a free course.
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
              placeholder="https://example.com/image.jpg"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
            />

            {formData.thumbnail.trim() && (
              <img
                src={formData.thumbnail}
                alt="Course thumbnail preview"
                className="mt-4 h-48 w-full rounded-lg border border-slate-700 object-cover"
                onError={(e) => {
                  e.currentTarget.style.visibility = "hidden";
                }}
                onLoad={(e) => {
                  e.currentTarget.style.visibility = "visible";
                }}
              />
            )}
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-800 pt-6 sm:flex-row">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>

            <Link
              to="/instructor/my-courses"
              className="rounded-lg border border-slate-700 px-5 py-3 text-center font-semibold text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}

export default EditCourse;