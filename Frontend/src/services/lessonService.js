import api from "./api";

const lessonService = {
  getLessonsByCourse: async (courseId) => {
    const response = await api.get(`/lessons/course/${courseId}`);
    return response.data;
  },

  getLessonById: async (lessonId) => {
    const response = await api.get(`/lessons/${lessonId}`);
    return response.data;
  },

  createLesson: async (courseId, lessonData) => {
    const response = await api.post(
      `/lessons/${courseId}`,
      lessonData
    );
    return response.data;
  },

  updateLesson: async (lessonId, lessonData) => {
    const response = await api.put(
      `/lessons/${lessonId}`,
      lessonData
    );
    return response.data;
  },

  deleteLesson: async (lessonId) => {
    const response = await api.delete(`/lessons/${lessonId}`);
    return response.data;
  },
};

export default lessonService;