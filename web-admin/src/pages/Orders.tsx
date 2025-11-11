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
import { Button, Card, Input, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui";

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

  const getStatusBadgeVariant = (status: string): "primary" | "secondary" | "success" | "warning" | "error" | "info" | "gray" => {
    switch (status) {
      case "completed":
        return "success";
      case "in_progress":
        return "primary";
      case "assigned":
        return "info";
      case "cancelled":
        return "error";
      case "created":
        return "warning";
      default:
        return "gray";
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

  return (
    <div className="animate-fade-in">
      <Card variant="elevated" padding="lg" className="animate-slide-up">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 font-display">Заказы</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Все заказы в системе
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="relative group">
              <Button
                variant="success"
                rightIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                }
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
              >
                Экспорт
              </Button>
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-medium py-1 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleExport("excel")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  📊 Excel (.xlsx)
                </button>
                <button
                  onClick={() => handleExport("csv")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  📄 CSV (.csv)
                </button>
              </div>
            </div>
            <Button
              variant="primary"
              onClick={handleCreate}
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              Создать заказ
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-error-50 dark:bg-error-900/30 border border-error-200 dark:border-error-700 text-error-700 dark:text-error-300 px-4 py-3 rounded-lg mb-6 animate-slide-up">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Переключатель вида */}
        <div className="mb-6 flex justify-end gap-2">
          <Button
            variant={viewMode === "table" ? "primary" : "outline"}
            size="sm"
            onClick={() => setViewMode("table")}
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            }
          >
            Таблица
          </Button>
          <Button
            variant={viewMode === "map" ? "primary" : "outline"}
            size="sm"
            onClick={() => setViewMode("map")}
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            }
          >
            Карта
          </Button>
        </div>

        {/* Поиск и фильтры */}
        <div className="mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              type="text"
              placeholder="Поиск по описанию, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            >
              <option value="all">Все статусы</option>
              <option value="created">Создан</option>
              <option value="assigned">Назначен</option>
              <option value="in_progress">В работе</option>
              <option value="completed">Завершен</option>
              <option value="cancelled">Отменен</option>
            </select>

            {(searchTerm !== "" || statusFilter !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                }
              >
                Сбросить
              </Button>
            )}
          </div>

          {/* Счетчик результатов */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Найдено: <span className="font-semibold text-gray-900 dark:text-gray-100">{filteredOrders.length}</span> из <span className="font-semibold text-gray-900 dark:text-gray-100">{orders.length}</span>
              {filteredOrders.length !== orders.length && (
                <Badge variant="info" size="sm" className="ml-2">
                  Экспорт к отфильтрованным данным
                </Badge>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Описание</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Сумма</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <p className="text-gray-500 dark:text-gray-400">Заказы не найдены</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="text-sm font-mono text-gray-900 dark:text-gray-100">
                          {order.id.substring(0, 8)}...
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {order.description || "(без описания)"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(order.status)} size="sm">
                          {getStatusLabel(order.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {(typeof order.totalAmount === 'number' ? order.totalAmount : parseFloat(String(order.totalAmount)) || 0).toFixed(2)} ₽
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString("ru-RU")}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          {order.status === "completed" && order.masterId && (
                            <>
                              {ordersWithReviews.has(order.id) ? (
                                <div className="flex items-center gap-2">
                                  <StarRating 
                                    rating={ordersWithReviews.get(order.id)?.rating || 0} 
                                    readonly 
                                    size="sm" 
                                  />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleOpenReviewModal(order)}
                                    title="Редактировать отзыв"
                                  >
                                    Редактировать
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenReviewModal(order)}
                                  title="Оставить отзыв"
                                  leftIcon={
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                  }
                                >
                                  Отзыв
                                </Button>
                              )}
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedOrderForHistory(order.id);
                              setIsHistoryModalOpen(true);
                            }}
                            title="История изменений"
                            leftIcon={
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            }
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedOrderForChat(order.id);
                              setIsChatOpen(true);
                            }}
                            title="Открыть чат"
                            leftIcon={
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                            }
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(order)}
                          >
                            Редактировать
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(order.id)}
                            className="text-error-600 hover:text-error-700"
                          >
                            Удалить
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
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
      </Card>

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
