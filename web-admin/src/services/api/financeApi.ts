import api from "../api";

export const financeAPI = {
  getOverview: async (params?: any) => {
    const response = await api.get("/v1/finance/overview", { params });
    return response.data;
  },

  getCommissions: async (params?: any) => {
    const response = await api.get("/v1/finance/commissions", { params });
    return response.data;
  },

  createPayout: async (data: any) => {
    const response = await api.post("/v1/finance/payouts", data);
    return response.data;
  },

  getReports: async (params?: any) => {
    const response = await api.get("/v1/finance/reports", { params });
    return response.data;
  },
};

