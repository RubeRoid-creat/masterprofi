import axios from "axios";

// В development используем прокси через Vite, в production - полный URL
// Используем тот же API, что и мобильное приложение
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV 
    ? "/api" // Прокси через Vite → http://localhost:3000/api
    : import.meta.env.VITE_API_URL_PROD || "http://localhost:3000/api"
  );

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 секунд таймаут
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Логирование запросов для отладки (только в dev режиме и только для важных запросов)
    if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_API === "true") {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error("[API Request Error]", error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    // Можно добавить логирование при необходимости для отладки
    // if (response.config?.url?.includes("/stats/dashboard")) {
    //   console.log("Dashboard stats API response:", response.data);
    // }
    return response;
  },
  (error) => {
    // Детальное логирование ошибок для отладки
    if (error.config) {
      console.error(`API Error [${error.config.method?.toUpperCase()}] ${error.config.url}:`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.response?.data?.message || error.message,
        data: error.response?.data,
        code: error.code
      });
    }

    // Обработка ошибок авторизации
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      // Не логируем 401 ошибки если пользователь на странице логина (это нормально)
      if (currentPath === "/login" || currentPath.includes("/login")) {
        // Это нормально - пользователь еще не залогинен
        return Promise.reject(error);
      }
      // Логируем только если пользователь должен быть авторизован
      if (localStorage.getItem("token")) {
        console.warn("Unauthorized - token may be invalid or expired");
        error.userMessage = "Требуется авторизация. Пожалуйста, войдите снова.";
      } else {
        // Пользователь не авторизован - это нормально, не логируем как ошибку
        error.userMessage = "Требуется авторизация.";
      }
    }
    
    // Обработка пустого ответа (204 No Content)
    if (error.response?.status === 204) {
      console.warn("204 No Content - endpoint returned empty response");
      error.userMessage = "Сервер вернул пустой ответ. Возможно, данные еще не загружены в базу.";
      // Создаем пустой объект вместо ошибки
      return Promise.resolve({ data: {} });
    }
    
    // Обработка сетевых ошибок
    if (!error.response) {
      // Любая ошибка без response - это сетевая ошибка
      console.error("Network error - Backend may be down:", {
        code: error.code,
        message: error.message,
        url: error.config?.url,
        baseURL: API_BASE_URL,
        fullError: error
      });
      
      // Добавляем более понятное сообщение об ошибке
      error.userMessage = "Не удалось подключиться к серверу. Убедитесь, что backend запущен на http://localhost:3000";
    } else if (error.code === "ERR_NETWORK" || error.message?.includes("Network Error") || error.code === "ECONNREFUSED") {
      console.error("Network error - Backend may be down:", {
        code: error.code,
        message: error.message,
        url: error.config?.url,
        baseURL: API_BASE_URL
      });
      
      // Добавляем более понятное сообщение об ошибке
      error.userMessage = "Не удалось подключиться к серверу. Убедитесь, что backend запущен на http://localhost:3000";
    }
    
    // Исправляем опечатки в сообщениях об ошибках (автозамена "API" -> "Англии")
    // Применяем ко всем сообщениям об ошибках
    if (error.userMessage) {
      error.userMessage = error.userMessage.replace(/Англии|England/gi, "API");
    }
    if (error.message) {
      error.message = error.message.replace(/Англии|England/gi, "API");
    }
    
    // Обработка 500 ошибок
    if (error.response?.status === 500) {
      const backendMessage = error.response.data?.message || "";
      if (backendMessage.includes("Англии") || backendMessage.includes("England")) {
        error.userMessage = backendMessage.replace(/Англии|England/gi, "API") + ". Попробуйте позже.";
      } else {
        error.userMessage = "Ошибка на сервере. Проверьте подключение к базе данных и логи бэкенда.";
      }
    }
    
    // Обработка таймаутов
    if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
      error.userMessage = "Превышено время ожидания ответа от сервера";
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },
  register: async (userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    role?: string;
  }) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },
  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.post("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getAll: async () => {
    const response = await api.get("/users");
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.patch(`/users/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get("/users/profile");
    return response.data;
  },
  updateProfile: async (data: {
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatar?: string;
  }) => {
    const response = await api.patch("/users/profile", data);
    return response.data;
  },
  getActivityHistory: async () => {
    const response = await api.get("/users/profile/activity");
    return response.data;
  },
};

// Orders API
export const ordersAPI = {
  getAll: async () => {
    const response = await api.get("/orders");
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post("/orders", data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.patch(`/orders/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },
  // History API
  getHistory: async (orderId: string) => {
    const response = await api.get(`/orders/${orderId}/history`);
    return response.data;
  },
  getStatusHistory: async (orderId: string) => {
    const response = await api.get(`/orders/${orderId}/history/status`);
    return response.data;
  },
  getMasterHistory: async (orderId: string) => {
    const response = await api.get(`/orders/${orderId}/history/masters`);
    return response.data;
  },
  getLatestChange: async (orderId: string) => {
    const response = await api.get(`/orders/${orderId}/history/latest`);
    return response.data;
  },
};

// MLM API
export const mlmAPI = {
  getUserStats: async (userId: string) => {
    const response = await api.get(`/mlm/stats/${userId}`);
    return response.data;
  },
  calculateCommissions: async (orderId: string, orderAmount: number, clientId: string) => {
    const response = await api.post("/mlm/calculate-commissions", {
      orderId,
      orderAmount,
      clientId,
    });
    return response.data;
  },
  processAutomaticPayout: async (userId: string, amount: number) => {
    const response = await api.post("/mlm/process-payout", {
      userId,
      amount,
    });
    return response.data;
  },
  getRealTimeCommissions: async (userId: string) => {
    const response = await api.get(`/mlm/realtime-commissions/${userId}`);
    return response.data;
  },
  getUserStructure: async (userId: string) => {
    const response = await api.get(`/mlm/structure/${userId}`);
    return response.data;
  },
  getOverallStats: async () => {
    const response = await api.get("/mlm/overall");
    return response.data;
  },
  getReferralCode: async (userId: string) => {
    const response = await api.get(`/mlm/referral-code/${userId}`);
    return response.data;
  },
  createReferral: async (data: { referrerId: string; referredId: string }) => {
    const response = await api.post("/mlm/referral", data);
    return response.data;
  },
  getUserBonuses: async (userId: string) => {
    const response = await api.get(`/mlm/bonuses/${userId}`);
    return response.data;
  },
};

// Reports API
export const reportsAPI = {
  generateOrdersReport: async (filters: any) => {
    const response = await api.post("/reports/orders", filters, {
      responseType: "blob",
    });
    return response;
  },
  generateMLMReport: async (filters: any) => {
    const response = await api.post("/reports/mlm", filters, {
      responseType: "blob",
    });
    return response;
  },
  generateFinancialReport: async (filters: any) => {
    const response = await api.post("/reports/financial", filters, {
      responseType: "blob",
    });
    return response;
  },
};

// Chat API
export const chatAPI = {
  getOrCreateChat: async (orderId: string) => {
    const response = await api.get(`/chat/order/${orderId}`);
    return response.data;
  },
  getChat: async (chatId: string) => {
    const response = await api.get(`/chat/${chatId}`);
    return response.data;
  },
  getMessages: async (chatId: string, limit = 50, offset = 0) => {
    const response = await api.get(`/chat/${chatId}/messages`, {
      params: { limit, offset },
    });
    return response.data;
  },
  getUserChats: async () => {
    const response = await api.get("/chat/user/chats");
    return response.data;
  },
  markAsRead: async (chatId: string) => {
    const response = await api.post(`/chat/${chatId}/read`);
    return response.data;
  },
  getUnreadCount: async () => {
    const response = await api.get("/chat/unread/count");
    return response.data;
  },
  uploadFile: async (chatId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post(`/chat/${chatId}/files`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};

// Payments API
export const paymentsAPI = {
  getAll: async () => {
    const response = await api.get("/payments");
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post("/payments", data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.patch(`/payments/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/payments/${id}`);
    return response.data;
  },
  findByUserId: async (userId: string) => {
    const response = await api.get(`/payments/user/${userId}`);
    return response.data;
  },
  findByOrderId: async (orderId: string) => {
    const response = await api.get(`/payments/order/${orderId}`);
    return response.data;
  },
};

// Geolocation API
export const geolocationAPI = {
  findNearestMasters: async (
    latitude: number,
    longitude: number,
    radius?: number,
    limit?: number,
    specialization?: string
  ) => {
    const params: any = { latitude, longitude };
    if (radius) params.radius = radius;
    if (limit) params.limit = limit;
    if (specialization) params.specialization = specialization;
    const response = await api.get("/geolocation/masters/nearest", { params });
    return response.data;
  },
  findNearestMastersForOrder: async (
    orderId: string,
    radius?: number,
    limit?: number
  ) => {
    const params: any = {};
    if (radius) params.radius = radius;
    if (limit) params.limit = limit;
    const response = await api.get(
      `/geolocation/orders/${orderId}/masters/nearest`,
      { params }
    );
    return response.data;
  },
  createRoute: async (startPoint: { latitude: number; longitude: number }, points: { latitude: number; longitude: number }[]) => {
    const response = await api.post("/geolocation/route", {
      startPoint,
      points,
    });
    return response.data;
  },
};

// Stats API
export const statsAPI = {
  getDashboardStats: async () => {
    const response = await api.get("/stats/dashboard");
    return response.data;
  },
};

// Reviews API
export const reviewsAPI = {
  create: async (data: {
    orderId: string;
    masterId: string;
    rating: number;
    comment?: string;
  }) => {
    const response = await api.post("/reviews", data);
    return response.data;
  },
  getAll: async (masterId?: string, orderId?: string) => {
    const params: any = {};
    if (masterId) params.masterId = masterId;
    if (orderId) params.orderId = orderId;
    const response = await api.get("/reviews", { params });
    return response.data;
  },
  getByOrder: async (orderId: string) => {
    const response = await api.get(`/reviews/order/${orderId}`);
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/reviews/${id}`);
    return response.data;
  },
  update: async (id: string, data: { rating?: number; comment?: string; isPublished?: boolean }) => {
    const response = await api.patch(`/reviews/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/reviews/${id}`);
    return response.data;
  },
  getMasterStats: async (masterId: string) => {
    const response = await api.get(`/reviews/master/${masterId}/stats`);
    return response.data;
  },
  getOverallStats: async () => {
    const response = await api.get("/reviews/overall/stats");
    return response.data;
  },
};

// CRM Sync API
export const crmAPI = {
  // Синхронизация
  initialSync: async () => {
    const response = await api.get("/sync/initial");
    return response.data;
  },
  incrementalSync: async (since?: string, entityTypes?: string[]) => {
    const params: any = {};
    if (since) params.since = since;
    if (entityTypes) params.entityTypes = entityTypes;
    const response = await api.get("/sync/incremental", { params });
    return response.data;
  },
  outgoingSync: async (changes: Array<{
    entityId: string;
    entityType: string;
    operation: "CREATE" | "UPDATE" | "DELETE";
    payload: Record<string, any>;
  }>) => {
    const response = await api.post("/sync/outgoing", { changes });
    return response.data;
  },
  getSyncStatus: async () => {
    const response = await api.get("/sync/status");
    return response.data;
  },

  // CRM данные
  getContacts: async () => {
    const response = await api.get("/crm/contacts");
    return response.data;
  },
  getDeals: async () => {
    const response = await api.get("/crm/deals");
    return response.data;
  },
  getTasks: async () => {
    const response = await api.get("/crm/tasks");
    return response.data;
  },
};

// Schedule API
export const scheduleAPI = {
  generateSlots: async (data: {
    masterId: string;
    startDate: string;
    endDate: string;
    slotDurationMinutes?: number;
    workingHours?: { start: string; end: string };
  }) => {
    const response = await api.post("/schedule/slots/generate", data);
    return response.data;
  },
  getMasterSlots: async (
    masterId: string,
    startDate: string,
    endDate: string,
    availableOnly?: boolean
  ) => {
    const params: any = { startDate, endDate };
    if (availableOnly) params.availableOnly = "true";
    const response = await api.get(`/schedule/masters/${masterId}/slots`, {
      params,
    });
    return response.data;
  },
  bookSlot: async (data: {
    masterId: string;
    startTime: string;
    endTime: string;
    orderId: string;
  }) => {
    const response = await api.post("/schedule/book", data);
    return response.data;
  },
  blockSlot: async (slotId: string) => {
    const response = await api.patch(`/schedule/slots/${slotId}/block`);
    return response.data;
  },
  unblockSlot: async (slotId: string) => {
    const response = await api.patch(`/schedule/slots/${slotId}/unblock`);
    return response.data;
  },
  releaseSlots: async (orderId: string) => {
    const response = await api.delete(`/schedule/orders/${orderId}/release`);
    return response.data;
  },
  getUpcomingOrdersForMaster: async (masterId: string, limit?: number) => {
    const params: any = {};
    if (limit) params.limit = limit;
    const response = await api.get(`/schedule/masters/${masterId}/upcoming`, {
      params,
    });
    return response.data;
  },
  getUpcomingOrdersForClient: async (clientId: string, limit?: number) => {
    const params: any = {};
    if (limit) params.limit = limit;
    const response = await api.get(`/schedule/clients/${clientId}/upcoming`, {
      params,
    });
    return response.data;
  },
};

export default api;

