import api from "./api";

const aiService = {
  // Ask the AI tutor a general question
  askTutor: async (question, context = {}) => {
    const response = await api.post("/ai/tutor", {
      question,
      ...context,
    });

    return response.data;
  },

  // Ask the AI to explain a topic
  explainTopic: async (topic, level = "beginner") => {
    const response = await api.post("/ai/explain", {
      topic,
      level,
    });

    return response.data;
  },

  // Generate a quiz using AI
  generateQuiz: async (payload) => {
    const response = await api.post("/ai/generate-quiz", payload);
    return response.data;
  },

  // Generate an AI study plan
  generateStudyPlan: async (payload) => {
    const response = await api.post("/ai/study-plan", payload);
    return response.data;
  },

  // Ask a question about a specific course lesson
  askQuestion: async ({ courseId, lessonId, question }) => {
    const response = await api.post(
      `/ai-tutor/${encodeURIComponent(courseId)}/lessons/${encodeURIComponent(lessonId)}/ask`,
      { question }
    );

    return response.data;
  },

  askCourseQuestion: async ({ courseId, question }) => {
    const response = await api.post(
      `/ai-tutor/${encodeURIComponent(courseId)}/ask`,
      { question }
    );

    return response.data;
  },
};

export default aiService;