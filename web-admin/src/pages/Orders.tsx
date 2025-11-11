import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import OrderModal from "../components/OrderModal";
import OrderHistoryModal from "../components/OrderHistoryModal";
import Chat from "../components/Chat";
import Pagination from "../components/Pagination";
import OrdersMap from "../components/OrdersMap";
import ReviewForm from "../components/ReviewForm";
import StarRating from "../components/StarRating";
import { ordersAPI, usersAPI, reviewsAPI, scheduleAPI } from "../services/api";
import { exportToExcel, exportToCSV, formatDate, formatAmount } from "../utils/export";
import { useSocket } from "../hooks/useSocket";

interface Order {
  id: string;
  clientId: string;
  totalAmount: number;
  description?: string;
  status: string;
  masterId?: string;
  createdAt: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  client?: {
    firstName?: string;
    lastName?: string;
  };
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedOrderForHistory, setSelectedOrderForHistory] = useState<string | null>(null);
  const [selectedOrderForChat, setSelectedOrderForChat] = useState<string | null>(null);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState<Order | null>(null);
  const [existingReview, setExistingReview] = useState<any>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [clients, setClients] = useState<any[]>([]);
  const [masters, setMasters] = useState<any[]>([]);
  const [ordersWithReviews, setOrdersWithReviews] = useState<Map<string, any>>(new Map());
  
  // Фильтры и поиск
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Пагинация
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Вид отображения (таблица или карта)
  const [viewMode, setViewMode] = useState<"table" | "map">("table");
  const [selectedOrderOnMap, setSelectedOrderOnMap] = useState<string | null>(null);
  const [showNearestMasters, setShowNearestMasters] = useState(false);

  // WebSocket для real-time обновлений
  const socket = useSocket();

  // Polling для синхронизации данных
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const POLLING_INTERVAL = 15000; // 15 секунд
  
  // Сохраняем loadOrders в ref для использования в useEffect
  const loadOrdersRef = useRef<() => void>(() => {});
  
  // Auto-refetch при фокусе окна
  useEffect(() => {
    const handleFocus = () => {
      console.log('[Orders] Window focused, refreshing data...');
      loadOrdersRef.current();
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
        console.log('[Orders] Polling: refreshing orders...');
        loadOrdersRef.current();
      }, POLLING_INTERVAL);
    };

    startPolling();
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // WebSocket listeners для real-time обновлений
  useEffect(() => {
    if (!socket) return;

    // Слушаем события, которые отправляет бэкенд
    const handleOrderCreated = (orderData: any) => {
      console.log('[Orders] WebSocket: New order created', orderData);
      // Перезагружаем заказы для получения полных данных
      loadOrdersRef.current();
    };

    const handleOrderStatusChanged = (data: { orderId: string; status: string; order?: any }) => {
      console.log('[Orders] WebSocket: Order status changed', data);
      if (data.order) {
        // Если пришел полный объект заказа, обновляем его
        setOrders((prevOrders) => {
          const index = prevOrders.findIndex((o) => o.id === data.order.id);
          if (index !== -1) {
            const newOrders = [...prevOrders];
            newOrders[index] = { ...newOrders[index], ...data.order, status: data.status };
            return newOrders;
          } else {
            // Новый заказ - добавляем в начало
            return [{ ...data.order, status: data.status }, ...prevOrders];
          }
        });
      } else {
        // Если только статус, обновляем статус и перезагружаем
        setOrders((prevOrders) => {
          const index = prevOrders.findIndex((o) => o.id === data.orderId);
          if (index !== -1) {
            const newOrders = [...prevOrders];
            newOrders[index] = { ...newOrders[index], status: data.status };
            return newOrders;
          }
          return prevOrders;
        });
        // Перезагружаем для получения полных данных
        loadOrdersRef.current();
      }
    };

    // Подписываемся на события бэкенда
    socket.on('order_created', handleOrderCreated);
    socket.on('order_status_changed', handleOrderStatusChanged);

    // Также слушаем события для совместимости (если они будут добавлены)
    socket.on('order:created', handleOrderCreated);
    socket.on('order:updated', (updatedOrder: Order) => {
      console.log('[Orders] WebSocket: Order updated', updatedOrder);
      setOrders((prevOrders) => {
        const index = prevOrders.findIndex((o) => o.id === updatedOrder.id);
        if (index !== -1) {
          const newOrders = [...prevOrders];
          newOrders[index] = updatedOrder;
          return newOrders;
        } else {
          return [...prevOrders, updatedOrder];
        }
      });
    });

    return () => {
      socket.off('order_created', handleOrderCreated);
      socket.off('order_status_changed', handleOrderStatusChanged);
      socket.off('order:created');
      socket.off('order:updated');
    };
  }, [socket]);

  useEffect(() => {
    loadOrders();
    loadClients();
    loadMasters();
    loadReviewsForOrders();
  }, []);

  useEffect(() => {
    if (orders.length > 0) {
      loadReviewsForOrders();
    }
  }, [orders]);

  const loadOrders = useCallback(async () => {
    try {
      const data = await ordersAPI.getAll();
      setOrders(Array.isArray(data) ? data : []);
      setError("");
    } catch (err: any) {
      console.error("Error loading orders:", err);
      const errorMessage = 
        err.userMessage ||
        err.response?.data?.message || 
        err.message || 
        (err.code === "ERR_NETWORK" || err.code === "ECONNREFUSED" 
          ? "Не удалось подключиться к серверу. Убедитесь, что backend запущен на http://localhost:3000" 
          : "Ошибка загрузки заказов");
      setError(errorMessage);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Обновляем ref при изменении loadOrders
  useEffect(() => {
    loadOrdersRef.current = loadOrders;
  }, [loadOrders]);

  const loadClients = async () => {
    try {
      const users = await usersAPI.getAll();
      const clientUsers = users.filter((u: any) => u.role === "client");
      setClients(clientUsers);
    } catch (err) {
      console.error("Error loading clients:", err);
    }
  };

  const loadMasters = async () => {
    try {
      const users = await usersAPI.getAll();
      const masterUsers = users.filter((u: any) => u.role === "master");
      setMasters(masterUsers);
    } catch (err) {
      console.error("Error loading masters:", err);
    }
  };

  const loadReviewsForOrders = async () => {
    try {
      const completedOrders = orders.filter((o) => o.status === "completed" && o.masterId);
      const reviewsMap = new Map();
      
      for (const order of completedOrders) {
        try {
          const review = await reviewsAPI.getByOrder(order.id);
          if (review) {
            reviewsMap.set(order.id, review);
          }
        } catch (err) {
          // Отзыв не найден - это нормально
        }
      }
      
      setOrdersWithReviews(reviewsMap);
    } catch (err) {
      console.error("Error loading reviews:", err);
    }
  };

  const handleOpenReviewModal = async (order: Order) => {
    setSelectedOrderForReview(order);
    
    // Проверяем, есть ли уже отзыв
    try {
      const review = await reviewsAPI.getByOrder(order.id);
      setExistingReview(review);
    } catch (err) {
      setExistingReview(null);
    }
    
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = async (data: { rating: number; comment: string }) => {
    if (!selectedOrderForReview?.masterId) return;

    try {
      if (existingReview) {
        // Обновляем существующий отзыв
        await reviewsAPI.update(existingReview.id, data);
      } else {
        // Создаем новый отзыв
        await reviewsAPI.create({
          orderId: selectedOrderForReview.id,
          masterId: selectedOrderForReview.masterId,
          rating: data.rating,
          comment: data.comment,
        });
      }
      
      setIsReviewModalOpen(false);
      setSelectedOrderForReview(null);
      setExistingReview(null);
      loadReviewsForOrders();
      loadOrders(); // Обновляем заказы, чтобы обновить рейтинги
    } catch (err: any) {
      console.error("Error submitting review:", err);
      alert(err.response?.data?.message || "Ошибка при сохранении отзыва");
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case "created":
        return "bg-blue-100 text-blue-800";
      case "assigned":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      created: "Создан",
      assigned: "Назначен",
      in_progress: "В работе",
      completed: "Завершен",
      cancelled: "Отменен",
    };
    return labels[status] || status;
  };

  // Экспорт данных
  const handleExport = (format: "excel" | "csv") => {
    const getClientName = (clientId: string) => {
      const client = clients.find((c) => c.id === clientId);
      return client ? `${client.firstName || ''} ${client.lastName || ''}`.trim() || client.email : clientId;
    };

    const getMasterName = (masterId?: string) => {
      if (!masterId) return "-";
      const master = masters.find((m) => m.id === masterId);
      return master ? `${master.firstName || ''} ${master.lastName || ''}`.trim() || master.email : masterId;
    };

    const columns = [
      { key: "id", label: "ID заказа" },
      { 
        key: "clientId", 
        label: "Клиент",
        format: getClientName
      },
      { 
        key: "masterId", 
        label: "Мастер",
        format: getMasterName
      },
      { 
        key: "description", 
        label: "Описание",
        format: (value: string) => value || "-"
      },
      { 
        key: "status", 
        label: "Статус",
        format: getStatusLabel
      },
      { 
        key: "totalAmount", 
        label: "Сумма (₽)",
        format: formatAmount
      },
      { 
        key: "createdAt", 
        label: "Дата создания",
        format: formatDate
      },
    ];

    if (format === "excel") {
      exportToExcel(filteredOrders, columns, {
        filename: `orders_${new Date().toISOString().split('T')[0]}.xlsx`,
        sheetName: "Заказы",
      });
    } else {
      exportToCSV(filteredOrders, columns, {
        filename: `orders_${new Date().toISOString().split('T')[0]}.csv`,
      });
    }
  };

  // Фильтрация заказов
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Поиск
      const matchesSearch =
        searchTerm === "" ||
        order.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.clientId.toLowerCase().includes(searchTerm.toLowerCase());

      // Фильтр по статусу
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  // Пагинация
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredOrders.slice(startIndex, endIndex);
  }, [filteredOrders, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  // Сброс на первую страницу при изменении фильтров
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const handleCreate = () => {
    setSelectedOrder(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleEdit = (order: any) => {
    setSelectedOrder(order);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleSave = async (orderData: any) => {
    try {
      if (modalMode === "create") {
        const createdOrder = await ordersAPI.create(orderData);
        
        // Если указано время, бронируем слот
        if (orderData.scheduledAt && orderData.masterId) {
          try {
            const scheduledDate = new Date(orderData.scheduledAt);
            const endDate = new Date(scheduledDate.getTime() + 60 * 60 * 1000); // +1 час
            
            await scheduleAPI.bookSlot({
              masterId: orderData.masterId,
              startTime: scheduledDate.toISOString(),
              endTime: endDate.toISOString(),
              orderId: createdOrder.id,
            });
          } catch (slotError: any) {
            console.error("Error booking slot:", slotError);
            // Не прерываем создание заказа, если не удалось забронировать слот
          }
        }
      } else if (selectedOrder?.id) {
        // При обновлении удаляем все поля которые бэкенд не принимает
        const { id, createdAt, updatedAt, client, master, ...updateData } = orderData;
        await ordersAPI.update(selectedOrder.id, updateData);
      }
      setIsModalOpen(false);
      loadOrders();
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Ошибка сохранения заказа");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот заказ?")) {
      return;
    }

    try {
      await ordersAPI.delete(id);
      loadOrders();
    } catch (err: any) {
      alert(err.response?.data?.message || "Ошибка удаления");
    }
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Заказы</h2>
              <p className="text-gray-600 mt-2">
                Все заказы в системе
              </p>
            </div>
            <div className="flex gap-3">
              {/* Экспорт */}
              <div className="relative group">
                <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Экспорт
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <button
                    onClick={() => handleExport("excel")}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    📊 Excel (.xlsx)
                  </button>
                  <button
                    onClick={() => handleExport("csv")}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    📄 CSV (.csv)
                  </button>
                </div>
              </div>
              <button
                onClick={handleCreate}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                + Создать заказ
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Переключатель вида */}
          <div className="mb-4 flex justify-end gap-2">
            <button
              onClick={() => setViewMode("table")}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewMode === "table"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              📋 Таблица
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewMode === "map"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              🗺️ Карта
            </button>
          </div>

          {/* Поиск и фильтры */}
          <div className="mb-6 space-y-4">
            {/* Поиск */}
            <div>
              <input
                type="text"
                placeholder="Поиск по описанию, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Фильтры */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Статус
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Все статусы</option>
                  <option value="created">Создан</option>
                  <option value="assigned">Назначен</option>
                  <option value="in_progress">В работе</option>
                  <option value="completed">Завершен</option>
                  <option value="cancelled">Отменен</option>
                </select>
              </div>

              {(searchTerm !== "" || statusFilter !== "all") && (
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                    }}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Сбросить
                  </button>
                </div>
              )}
            </div>

            {/* Счетчик результатов и информация об экспорте */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Найдено: {filteredOrders.length} из {orders.length}
                {filteredOrders.length !== orders.length && (
                  <span className="ml-2 text-blue-600">
                    (Экспорт будет применен к отфильтрованным данным)
                  </span>
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Загрузка...</p>
            </div>
          ) : viewMode === "map" ? (
            <div className="relative h-[600px] rounded-lg overflow-hidden border border-gray-200">
              <OrdersMap
                orders={filteredOrders.filter((o) => o.latitude && o.longitude)}
                selectedOrderId={selectedOrderOnMap || undefined}
                onOrderClick={(order) => {
                  setSelectedOrderOnMap(order.id);
                  handleEdit(order);
                }}
                showNearestMasters={showNearestMasters}
              />
              <div className="absolute bottom-4 right-4 z-10">
                <button
                  onClick={() => setShowNearestMasters(!showNearestMasters)}
                  className="bg-white dark:bg-gray-800 px-4 py-2 rounded shadow-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {showNearestMasters ? "Скрыть ближайших мастеров" : "Показать ближайших мастеров"}
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Описание
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Статус
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Сумма
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Дата
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-900">
                          {order.id.substring(0, 8)}...
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {order.description || "(без описания)"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}
                        >
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {(typeof order.totalAmount === 'number' ? order.totalAmount : parseFloat(order.totalAmount) || 0).toFixed(2)} ₽
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString("ru-RU")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2 flex-wrap">
                          {order.status === "completed" && order.masterId && (
                            <>
                              {ordersWithReviews.has(order.id) ? (
                                <div className="flex items-center gap-2 mr-2">
                                  <StarRating 
                                    rating={ordersWithReviews.get(order.id)?.rating || 0} 
                                    readonly 
                                    size="sm" 
                                  />
                                  <button
                                    onClick={() => handleOpenReviewModal(order)}
                                    className="text-yellow-600 hover:text-yellow-900 text-xs"
                                    title="Редактировать отзыв"
                                  >
                                    Редактировать
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleOpenReviewModal(order)}
                                  className="text-yellow-600 hover:text-yellow-900 flex items-center"
                                  title="Оставить отзыв"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                  </svg>
                                  <span className="ml-1 text-xs">Отзыв</span>
                                </button>
                              )}
                            </>
                          )}
                          <button
                            onClick={() => {
                              setSelectedOrderForHistory(order.id);
                              setIsHistoryModalOpen(true);
                            }}
                            className="text-purple-600 hover:text-purple-900 flex items-center"
                            title="История изменений"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedOrderForChat(order.id);
                              setIsChatOpen(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                            title="Открыть чат"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEdit(order)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Редактировать
                          </button>
                          <button
                            onClick={() => handleDelete(order.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Удалить
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredOrders.length === 0 && orders.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-600">Нет заказов</p>
                </div>
              )}

              {filteredOrders.length === 0 && orders.length > 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-600">Ничего не найдено</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Попробуйте изменить фильтры
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Пагинация (только для таблицы) */}
          {viewMode === "table" && filteredOrders.length > 0 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={filteredOrders.length}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(items) => {
                  setItemsPerPage(items);
                  setCurrentPage(1);
                }}
              />
            </div>
          )}
        </div>
      </div>

      <OrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        order={selectedOrder}
        mode={modalMode}
        clients={clients}
        masters={masters}
      />

      <OrderHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => {
          setIsHistoryModalOpen(false);
          setSelectedOrderForHistory(null);
        }}
        orderId={selectedOrderForHistory || ""}
        orderNumber={selectedOrderForHistory?.substring(0, 8)}
      />

      {/* Chat Modal */}
      {isChatOpen && selectedOrderForChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Чат по заказу
              </h3>
              <button
                onClick={() => {
                  setIsChatOpen(false);
                  setSelectedOrderForChat(null);
                }}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <Chat
                orderId={selectedOrderForChat}
                onClose={() => {
                  setIsChatOpen(false);
                  setSelectedOrderForChat(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {isReviewModalOpen && selectedOrderForReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {existingReview ? "Редактировать отзыв" : "Оставить отзыв"}
              </h3>
              <button
                onClick={() => {
                  setIsReviewModalOpen(false);
                  setSelectedOrderForReview(null);
                  setExistingReview(null);
                }}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <ReviewForm
                onSubmit={handleSubmitReview}
                onCancel={() => {
                  setIsReviewModalOpen(false);
                  setSelectedOrderForReview(null);
                  setExistingReview(null);
                }}
                initialData={existingReview ? {
                  rating: existingReview.rating,
                  comment: existingReview.comment,
                } : undefined}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
