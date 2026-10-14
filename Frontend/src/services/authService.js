import api from "./api";

const authService = {
  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);

    const data = response.data;
    const token = data.token || data.accessToken;

    if (token) {
      localStorage.setItem("token", token);
    }

    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    return data;
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },

  getProfile: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },
};

export default authService;