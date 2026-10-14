import api from "./api";

const progressService = {
  async getMyProgress() {
    const response = await api.get("/progress/my-progress");
    return response.data;
  },
};

export default progressService;