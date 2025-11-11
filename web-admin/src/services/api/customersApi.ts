import api from "../api";

export const customersAPI = {
  getAll: async (params?: any) => {
    const response = await api.get("/v1/customers", { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/v1/customers/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post("/v1/customers", data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/v1/customers/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/v1/customers/${id}`);
    return response.data;
  },

  getHistory: async (id: string) => {
    const response = await api.get(`/v1/customers/${id}/history`);
    return response.data;
  },

  createOrder: async (customerId: string, orderData: any) => {
    const response = await api.post(`/v1/customers/${customerId}/orders`, orderData);
    return response.data;
  },
};

