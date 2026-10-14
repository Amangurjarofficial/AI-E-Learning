import api from "./api";

const enrollmentService = {
  enrollInCourse: async (courseId) => {
    const response = await api.post(
      `/enrollments/${courseId}`
    );
    return response.data;
  },

  getMyEnrollments: async () => {
    const response = await api.get("/enrollments/my-courses");
    return response.data;
  },

  checkEnrollment: async (courseId) => {
    const response = await api.get(
      `/enrollments/${courseId}/check`
    );
    return response.data;
  },

  cancelEnrollment: async (courseId) => {
    const response = await api.delete(
      `/enrollments/${courseId}`
    );
    return response.data;
  },
};

export default enrollmentService;