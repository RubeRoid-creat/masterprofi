import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { statsAPI, usersAPI, ordersAPI, paymentsAPI } from "../services/api";
import { useTranslation } from "react-i18next";
import { useDataSync } from "../hooks/useDataSync";

export default function Dashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    users: 0,
    orders: 0,
    masters: 0,
    revenue: 0,
    averageCheck: 0,
    conversion: 0,
  });
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [periodFilter, setPeriodFilter] = useState<"week" | "month" | "year">("month");
  
  // Debug: логируем изменения stats и loading (только при изменении)
  useEffect(() => {
    if (!loading) {
      console.log("✅ Dashboard stats loaded:", stats);
    }
  }, [stats, loading]);

  // Polling для автоматического обновления
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const POLLING_INTERVAL = 30000; // 30 секунд для dashboard
  const loadStatsRef = useRef<() => void>(() => {});

  // Auto-refetch при фокусе окна
  useEffect(() => {
    const handleFocus = () => {
      console.log('[Dashboard] Window focused, refreshing stats...');
      loadStatsRef.current();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Polling для автоматического обновления
  useEffect(() => {
    const startPolling = () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      pollingIntervalRef.current = setInterval(() => {
        console.log('[Dashboard] Polling: refreshing stats...');
        loadStatsRef.current();
      }, POLLING_INTERVAL);
    };
    startPolling();
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(""); // Очищаем ошибку перед загрузкой
    
    try {
      // Пробуем использовать новый оптимизированный API со статистикой
      try {
        const dashboardStats = await statsAPI.getDashboardStats();
        
        const totalUsers = dashboardStats?.users?.total ?? 0;
        const mastersCount = dashboardStats?.users?.masters ?? 0;
        const totalOrders = dashboardStats?.orders?.total ?? 0;
        const completedOrders = dashboardStats?.orders?.completed ?? 0;
        const totalRevenue = dashboardStats?.payments?.revenue ?? 0;
        const averageCheck = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        const conversion = totalUsers > 0 ? (completedOrders / totalUsers) * 100 : 0;
        
        // Проверяем, есть ли вообще данные
        if (totalUsers === 0 && totalOrders === 0 && totalRevenue === 0) {
          console.info("ℹ️ Dashboard: No data in database yet. This is normal for a new system.");
          setError("");
        } else {
          setError("");
        }

        const newStats = {
          users: totalUsers,
          masters: mastersCount,
          orders: totalOrders,
          revenue: totalRevenue,
          averageCheck: averageCheck,
          conversion: conversion,
        };
        
        setStats(newStats);
        console.log("✅ Dashboard stats updated:", newStats);

        // Загружаем полные данные для графиков (в фоне, без блокировки)
        Promise.all([
          usersAPI.getAll().catch(() => []),
          ordersAPI.getAll().catch(() => []),
          paymentsAPI.getAll().catch(() => []),
        ]).then(([usersData, ordersData, paymentsData]) => {
          setUsers(usersData);
          setOrders(ordersData);
          setPayments(paymentsData);
        }).catch((err) => {
          console.warn("Error loading detailed data:", err);
          // Не показываем ошибку, т.к. основные данные уже загружены
        });
        
        // Успешно загружено, очищаем ошибки
        setError("");
      } catch (statsError: any) {
        // Fallback на старый способ загрузки данных
        console.warn("Stats API not available, using fallback:", statsError);
        console.warn("Error details:", {
          status: statsError.response?.status,
          message: statsError.response?.data?.message || statsError.message,
          code: statsError.code
        });
        
        try {
          const [usersData, ordersData, paymentsData] = await Promise.all([
            usersAPI.getAll(),
            ordersAPI.getAll(),
            paymentsAPI.getAll(),
          ]);
          
          setUsers(usersData);
          setOrders(ordersData);
          setPayments(paymentsData);
          
          const mastersCount = usersData.filter((u: any) => u.role === "master").length;
          
          // Расчет доходов (только завершенные платежи)
          const completedPayments = paymentsData.filter((p: any) => p.status === "completed");
          const revenue = completedPayments.reduce((sum: number, p: any) => {
            const amount = typeof p.amount === "number" ? p.amount : parseFloat(String(p.amount || 0));
            return sum + (isNaN(amount) ? 0 : amount);
          }, 0);
          
          // Расчет среднего чека
          const completedOrders = ordersData.filter((o: any) => o.status === "completed");
          const totalAmount = completedOrders.reduce((sum: number, o: any) => {
            const amount = typeof o.totalAmount === "number" ? o.totalAmount : parseFloat(String(o.totalAmount || 0));
            return sum + (isNaN(amount) ? 0 : amount);
          }, 0);
          const averageCheck = completedOrders.length > 0 ? totalAmount / completedOrders.length : 0;
          
          // Расчет конверсии (завершенные / все заказы * 100)
          const conversion = ordersData.length > 0 
            ? (completedOrders.length / ordersData.length) * 100 
            : 0;
          
          setStats({
            users: usersData.length || 0,
            orders: ordersData.length || 0,
            masters: mastersCount,
            revenue: revenue,
            averageCheck: averageCheck,
            conversion: conversion,
          });
          
          // Успешно загружено через fallback
          setError("");
        } catch (fallbackError: any) {
          // Оба способа не сработали
          throw fallbackError;
        }
      }
    } catch (error: any) {
      console.error("Error loading stats:", error);
      
      // Определяем тип ошибки и выводим соответствующее сообщение
      let errorMessage = "Ошибка загрузки данных";
      
      if (error.response) {
        // HTTP ошибка
        if (error.response.status === 401) {
          errorMessage = "Требуется авторизация. Пожалуйста, войдите снова.";
        } else if (error.response.status === 403) {
          errorMessage = "Доступ запрещен";
        } else if (error.response.status === 500) {
          errorMessage = "Ошибка на сервере. Проверьте подключение к базе данных и логи бэкенда.";
        } else if (error.response.data?.message) {
          // Исправляем опечатки в сообщениях об ошибках
          let msg = error.response.data.message;
          if (msg.includes("Англии") || msg.includes("England")) {
            msg = msg.replace(/Англии|England/gi, "API");
          }
          errorMessage = msg;
        } else {
          errorMessage = `Ошибка ${error.response.status}: ${error.response.statusText}`;
        }
      } else if (error.code === "ERR_NETWORK" || error.message?.includes("Network Error")) {
        errorMessage = "Не удалось подключиться к серверу. Проверьте, что backend запущен на порту 3000.";
      } else if (error.userMessage) {
        // Исправляем опечатки в пользовательских сообщениях
        let msg = error.userMessage;
        if (msg.includes("Англии") || msg.includes("England")) {
          msg = msg.replace(/Англии|England/gi, "API");
        }
        errorMessage = msg;
      }
      
      setError(errorMessage);
      
      // Устанавливаем значения по умолчанию при ошибке, чтобы не показывать "..."
      setStats({
        users: 0,
        masters: 0,
        orders: 0,
        revenue: 0,
        averageCheck: 0,
        conversion: 0,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Обновляем ref при изменении loadStats
  useEffect(() => {
    loadStatsRef.current = loadStats;
  }, [loadStats]);

  // WebSocket синхронизация для обновления статистики при изменениях данных
  useDataSync({
    onOrderCreated: useCallback(() => {
      console.log('[Dashboard] Order created, refreshing stats...');
      loadStatsRef.current();
    }, []),
    onOrderStatusChanged: useCallback(() => {
      console.log('[Dashboard] Order status changed, refreshing stats...');
      loadStatsRef.current();
    }, []),
    onPaymentCreated: useCallback(() => {
      console.log('[Dashboard] Payment created, refreshing stats...');
      loadStatsRef.current();
    }, []),
    onPaymentUpdated: useCallback(() => {
      console.log('[Dashboard] Payment updated, refreshing stats...');
      loadStatsRef.current();
    }, []),
    onUserCreated: useCallback(() => {
      console.log('[Dashboard] User created, refreshing stats...');
      loadStatsRef.current();
    }, []),
  });

  // Данные для круговой диаграммы ролей
  const roleData = useMemo(() => {
    const roleCounts: { [key: string]: number } = { admin: 0, master: 0, client: 0 };
    users.forEach((user) => {
      if (roleCounts[user.role] !== undefined) {
        roleCounts[user.role]++;
      }
    });

    return [
      { name: "Клиенты", value: roleCounts.client, color: "#3B82F6" },
      { name: "Мастера", value: roleCounts.master, color: "#A855F7" },
      { name: "Админы", value: roleCounts.admin, color: "#EF4444" },
    ].filter((item) => item.value > 0);
  }, [users]);

  // Данные для столбчатой диаграммы статусов заказов
  const orderStatusData = useMemo(() => {
    const statusCounts: { [key: string]: number } = {
      created: 0,
      assigned: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
    };

    orders.forEach((order) => {
      if (statusCounts[order.status] !== undefined) {
        statusCounts[order.status]++;
      }
    });

    return [
      { name: "Созданы", count: statusCounts.created },
      { name: "Назначены", count: statusCounts.assigned },
      { name: "В работе", count: statusCounts.in_progress },
      { name: "Завершены", count: statusCounts.completed },
      { name: "Отменены", count: statusCounts.cancelled },
    ];
  }, [orders]);

  // const COLORS = ["#3B82F6", "#A855F7", "#EF4444", "#10B981", "#F59E0B"];

  // График доходов по периодам
  const revenueByPeriod = useMemo(() => {
    const now = new Date();
    let days = 7;
    if (periodFilter === "month") days = 30;
    if (periodFilter === "year") days = 365;

    const completedPayments = payments.filter((p: any) => p.status === "completed");
    const revenueMap: { [key: string]: number } = {};

    // Инициализация всех дней нулями
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      revenueMap[key] = 0;
    }

    // Заполнение данных из платежей
    completedPayments.forEach((payment: any) => {
      const paymentDate = new Date(payment.createdAt);
      const key = paymentDate.toISOString().split('T')[0];
      
      if (revenueMap[key] !== undefined) {
        const amount = typeof payment.amount === "number" 
          ? payment.amount 
          : parseFloat(String(payment.amount || 0));
        revenueMap[key] += isNaN(amount) ? 0 : amount;
      }
    });

    return Object.entries(revenueMap).map(([date, revenue]) => ({
      date: new Date(date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
      revenue: Math.round(revenue * 100) / 100,
    }));
  }, [payments, periodFilter]);

  // Статистика по мастерам
  const mastersStats = useMemo(() => {
    const masters = users.filter((u: any) => u.role === "master");
    
    return masters.map((master: any) => {
      const masterOrders = orders.filter((o: any) => o.masterId === master.id);
      const completedOrders = masterOrders.filter((o: any) => o.status === "completed");
      const totalRevenue = completedOrders.reduce((sum: number, o: any) => {
        const amount = typeof o.totalAmount === "number" ? o.totalAmount : parseFloat(String(o.totalAmount || 0));
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);

      return {
        id: master.id,
        name: master.firstName && master.lastName 
          ? `${master.firstName} ${master.lastName}` 
          : master.email,
        email: master.email,
        totalOrders: masterOrders.length,
        completedOrders: completedOrders.length,
        revenue: totalRevenue,
        conversion: masterOrders.length > 0 
          ? (completedOrders.length / masterOrders.length) * 100 
          : 0,
      };
    }).sort((a, b) => b.revenue - a.revenue).slice(0, 10); // Топ 10
  }, [users, orders]);

  return (
    <div>
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t("dashboard.title")}</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t("dashboard.overview")}
          </p>
        </div>

            {error && (
              <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
                <button
                  onClick={() => {
                    setError("");
                    loadStats();
                  }}
                  className="ml-4 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                >
                  Повторить
                </button>
              </div>
            )}

        {/* Фильтр периода */}
        <div className="mb-6 flex justify-end">
          <div className="flex gap-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-1">
            <button
              onClick={() => setPeriodFilter("week")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                periodFilter === "week"
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {t("dashboard.period.week")}
            </button>
            <button
              onClick={() => setPeriodFilter("month")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                periodFilter === "month"
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {t("dashboard.period.month")}
            </button>
            <button
              onClick={() => setPeriodFilter("year")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                periodFilter === "year"
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {t("dashboard.period.year")}
            </button>
          </div>
        </div>

        {/* Quick Reports Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">{t("dashboard.quickReports")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate("/reports")}
              className="flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-2">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900 dark:text-gray-100">{t("dashboard.ordersReport")}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{t("dashboard.ordersReportDesc")}</div>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button
              onClick={() => navigate("/reports")}
              className="flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 dark:bg-purple-900 rounded-full p-2">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900 dark:text-gray-100">{t("dashboard.mlmReport")}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{t("dashboard.mlmReportDesc")}</div>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button
              onClick={() => navigate("/reports")}
              className="flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-green-500 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="bg-green-100 dark:bg-green-900 rounded-full p-2">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900 dark:text-gray-100">{t("dashboard.financialReport")}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{t("dashboard.financialReportDesc")}</div>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("dashboard.users")}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                  {loading ? "..." : stats.users}
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-3">
                <svg
                  className="w-8 h-8 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Заказы</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                  {loading ? "..." : stats.orders}
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900 rounded-full p-3">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Мастера</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                  {loading ? "..." : stats.masters}
                </p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900 rounded-full p-3">
                <svg
                  className="w-8 h-8 text-purple-600 dark:text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Доходы */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Доходы</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                  {loading ? "..." : `${Math.round(stats.revenue).toLocaleString('ru-RU')} ₽`}
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900 rounded-full p-3">
                <svg
                  className="w-8 h-8 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Средний чек */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Средний чек</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                  {loading ? "..." : `${Math.round(stats.averageCheck).toLocaleString('ru-RU')} ₽`}
                </p>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900 rounded-full p-3">
                <svg
                  className="w-8 h-8 text-yellow-600 dark:text-yellow-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Конверсия */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Конверсия</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                  {loading ? "..." : `${stats.conversion.toFixed(1)}%`}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Завершено заказов
                </p>
              </div>
              <div className="bg-indigo-100 dark:bg-indigo-900 rounded-full p-3">
                <svg
                  className="w-8 h-8 text-indigo-600 dark:text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Графики */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* График доходов по периодам */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Доходы по периодам
            </h3>
            {revenueByPeriod.length > 0 && revenueByPeriod.some((d) => d.revenue > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueByPeriod}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toLocaleString('ru-RU')} ₽`, 'Доход']}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name="Доход (₽)"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">Нет данных для отображения</p>
              </div>
            )}
          </div>
          {/* Круговая диаграмма ролей */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Распределение пользователей
            </h3>
            {roleData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={roleData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {roleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">Нет данных для отображения</p>
              </div>
            )}
          </div>

          {/* Столбчатая диаграмма статусов заказов */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Статусы заказов
            </h3>
            {orderStatusData.some((d) => d.count > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={orderStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3B82F6" name="Количество" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">Нет данных для отображения</p>
              </div>
            )}
          </div>
        </div>

        {/* Статистика по мастерам */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Топ мастера по доходам
          </h3>
          {mastersStats.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Мастер
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Всего заказов
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Завершено
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Доход (₽)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Конверсия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mastersStats.map((master) => (
                    <tr key={master.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {master.name}
                        </div>
                        <div className="text-sm text-gray-500">{master.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {master.totalOrders}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {master.completedOrders}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {Math.round(master.revenue).toLocaleString('ru-RU')} ₽
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          master.conversion >= 70 
                            ? "bg-green-100 text-green-800"
                            : master.conversion >= 50
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {master.conversion.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Нет данных о мастерах</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Быстрые действия
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate("/users")}
              className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg
                className="w-6 h-6 text-blue-600 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <div className="text-left">
                <p className="font-medium text-gray-900">Добавить пользователя</p>
                <p className="text-sm text-gray-600">Создать новый аккаунт</p>
              </div>
            </button>

            <button
              onClick={() => navigate("/orders")}
              className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg
                className="w-6 h-6 text-green-600 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <div className="text-left">
                <p className="font-medium text-gray-900">Просмотр заказов</p>
                <p className="text-sm text-gray-600">Все заказы</p>
              </div>
            </button>

            <button
              onClick={() => navigate("/mlm")}
              className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg
                className="w-6 h-6 text-purple-600 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
              <div className="text-left">
                <p className="font-medium text-gray-900">MLM аналитика</p>
                <p className="text-sm text-gray-600">Комиссии и доходы</p>
              </div>
            </button>
          </div>
        </div>
    </div>
  );
}

