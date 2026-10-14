import api from "./api";

const quizService = {
  // Get all quizzes, with optional filters
  getQuizzes: async (params = {}) => {
    const response = await api.get("/quizzes", { params });
    return response.data;
  },

  // Get one quiz by ID
  getQuizById: async (quizId) => {
    const response = await api.get(
      `/quizzes/${encodeURIComponent(quizId)}`
    );
    return response.data;
  },

  getQuizzesByCourse: async (courseId) => {
    const response = await api.get(
      `/quizzes/courses/${encodeURIComponent(courseId)}`
    );
    return response.data;
  },

  // Generate a quiz using the existing generic endpoint
  generateQuiz: async (payload) => {
    const response = await api.post("/quizzes/generate", payload);
    return response.data;
  },

  // Generate a quiz for a specific course lesson
  generateQuizForLesson: async (
    courseId,
    lessonId,
    numberOfQuestions = 5
  ) => {
    const response = await api.post(
      `/quizzes/courses/${encodeURIComponent(courseId)}/lessons/${encodeURIComponent(lessonId)}/generate`,
      { numberOfQuestions }
    );
    return response.data;
  },

  // Submit answers for a quiz
  submitQuiz: async (quizId, answers) => {
    const response = await api.post(
      `/quizzes/${encodeURIComponent(quizId)}/submit`,
      { answers }
    );
    return response.data;
  },

  // Get the current user's quiz results
  getMyQuizResults: async () => {
    const response = await api.get("/quizzes/my-results");
    return response.data;
  },
};

export default quizService;