import api from "../api";

export const mastersAPI = {
  getAll: async (params?: any) => {
    const response = await api.get("/v1/masters", { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/v1/masters/${id}`);
    return response.data;
  },

  getPerformance: async (id: string) => {
    const response = await api.get(`/v1/masters/${id}/performance`);
    return response.data;
  },

  updateAvailability: async (id: string, data: { available: boolean; schedule?: any }) => {
    const response = await api.put(`/v1/masters/${id}/availability`, data);
    return response.data;
  },
};

