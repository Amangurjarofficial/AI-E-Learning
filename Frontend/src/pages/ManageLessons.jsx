import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import courseService from "../services/courseService";
import lessonService from "../services/lessonService";

function ManageLessons() {
  const { id } = useParams();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    duration: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchLessons = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await courseService.getCourseById(id);
      const courseData = response.course ?? response;

      setCourse(courseData);
      setLessons(
        Array.isArray(courseData.lessons) ? courseData.lessons : []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load course lessons. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  const handleChange = (e) => {
    setFormData((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      videoUrl: "",
      duration: "",
    });

    setEditingId(null);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.title.trim() || !formData.description.trim()) {
      setError("Please enter both the lesson title and description.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        videoUrl: formData.videoUrl.trim(),
        duration: formData.duration.trim(),
      };

      if (editingId) {
        await lessonService.updateLesson(editingId, payload);
      } else {
        await lessonService.createLesson(id, payload);
      }

      await fetchLessons();

      setFormData({
        title: "",
        description: "",
        videoUrl: "",
        duration: "",
      });

      setEditingId(null);
      setSuccess(
        editingId
          ? "Lesson updated successfully."
          : "Lesson added successfully."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save the lesson. Please check your backend routes."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (lesson) => {
    setEditingId(lesson._id);

    setFormData({
      title: lesson.title || "",
      description: lesson.description || "",
      videoUrl: lesson.videoUrl || lesson.videoURL || "",
      duration: lesson.duration || "",
    });

    setError("");
    setSuccess("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (lessonId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this lesson?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(lessonId);
      setError("");
      setSuccess("");

      await lessonService.deleteLesson(lessonId);

      setLessons((previous) =>
        previous.filter((lesson) => lesson._id !== lessonId)
      );

      if (editingId === lessonId) {
        setFormData({
          title: "",
          description: "",
          videoUrl: "",
          duration: "",
        });
        setEditingId(null);
      }

      setSuccess("Lesson deleted successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete the lesson. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />
            <p className="mt-4 text-slate-300">Loading lessons...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <p className="mb-6 text-red-400">{error}</p>
          <button
            type="button"
            onClick={fetchLessons}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              to="/instructor"
              className="mb-3 inline-block text-sm text-blue-400 hover:text-blue-300"
            >
              ← Back to Dashboard
            </Link>

            <h1 className="text-3xl font-bold sm:text-4xl">
              Manage Lessons
            </h1>

            <p className="mt-2 text-slate-400">
              Course: {course?.title || "Untitled Course"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-3">
            <p className="text-sm text-slate-400">Total Lessons</p>
            <p className="text-2xl font-bold text-blue-400">
              {lessons.length}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-green-300">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          <section className="h-fit rounded-2xl border border-slate-800 bg-slate-900 p-6 lg:col-span-2">
            <h2 className="mb-6 text-xl font-semibold">
              {editingId ? "Edit Lesson" : "Add New Lesson"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Lesson Title *
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Introduction to React"
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="What will students learn in this lesson?"
                  rows={4}
                  required
                  className="w-full resize-y rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label
                  htmlFor="videoUrl"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Video URL
                </label>
                <input
                  id="videoUrl"
                  name="videoUrl"
                  type="url"
                  value={formData.videoUrl}
                  onChange={handleChange}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label
                  htmlFor="duration"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Duration
                </label>
                <input
                  id="duration"
                  name="duration"
                  type="text"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="e.g. 15 minutes"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Lesson"
                    : "Add Lesson"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="w-full rounded-lg border border-slate-700 px-5 py-3 font-semibold text-slate-300 transition hover:bg-slate-800 disabled:opacity-60"
                >
                  Cancel Editing
                </button>
              )}
            </form>
          </section>

          <section className="lg:col-span-3">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Course Lessons</h2>
              <span className="text-sm text-slate-400">
                {lessons.length} lesson(s)
              </span>
            </div>

            {lessons.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 px-6 py-16 text-center">
                <div className="mb-4 text-4xl">📚</div>
                <h3 className="text-lg font-semibold">No lessons yet</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Use the form to add your first lesson to this course.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {lessons.map((lesson, index) => (
                  <article
                    key={lesson._id || index}
                    className="rounded-xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-700"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 font-semibold text-blue-400">
                          {index + 1}
                        </div>

                        <div className="min-w-0">
                          <h3 className="break-words font-semibold">
                            {lesson.title}
                          </h3>

                          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-400">
                            {lesson.description}
                          </p>

                          {lesson.duration && (
                            <p className="mt-3 text-xs text-slate-500">
                              Duration: {lesson.duration}
                            </p>
                          )}

                          {(lesson.videoUrl || lesson.videoURL) && (
                            <a
                              href={lesson.videoUrl || lesson.videoURL}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-3 inline-block text-sm text-blue-400 hover:text-blue-300"
                            >
                              Open lesson video ↗
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 gap-2 sm:justify-end">
                        <button
                          type="button"
                          onClick={() => handleEdit(lesson)}
                          disabled={Boolean(deletingId)}
                          className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(lesson._id)}
                          disabled={Boolean(deletingId)}
                          className="rounded-lg border border-red-500/30 px-3 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId === lesson._id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default ManageLessons;