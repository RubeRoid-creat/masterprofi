import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import PaymentModal from "../components/PaymentModal";
import Pagination from "../components/Pagination";
import { paymentsAPI, usersAPI, ordersAPI } from "../services/api";
import { useDataSync } from "../hooks/useDataSync";

interface Payment {
  id: string;
  userId: string;
  type: string;
  status: string;
  amount: number;
  currency?: string;
  description?: string;
  orderId?: string;
  transactionId?: string;
  gateway?: string;
  createdAt: string;
}

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  // Фильтры и поиск
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Пагинация
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Polling для автоматического обновления
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const POLLING_INTERVAL = 15000; // 15 секунд
  const loadPaymentsRef = useRef<() => void>(() => {});

  // Auto-refetch при фокусе окна
  useEffect(() => {
    const handleFocus = () => {
      console.log('[Payments] Window focused, refreshing data...');
      loadPaymentsRef.current();
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
        console.log('[Payments] Polling: refreshing payments...');
        loadPaymentsRef.current();
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
    loadPayments();
    loadUsers();
    loadOrders();
  }, []);

  const loadPayments = useCallback(async () => {
    try {
      const data = await paymentsAPI.getAll();
      // Нормализация данных - преобразование amount в число
      const normalizedPayments = Array.isArray(data) ? data.map((payment: any) => ({
        ...payment,
        amount: typeof payment.amount === "number" 
          ? payment.amount 
          : parseFloat(String(payment.amount || 0)) || 0,
      })) : [];
      setPayments(normalizedPayments);
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Ошибка загрузки платежей");
    } finally {
      setLoading(false);
    }
  }, []);

  // Обновляем ref при изменении loadPayments
  useEffect(() => {
    loadPaymentsRef.current = loadPayments;
  }, [loadPayments]);

  // WebSocket синхронизация
  useDataSync({
    onPaymentCreated: useCallback((payment: any) => {
      console.log('[Payments] WebSocket: New payment created', payment);
      const normalizedPayment = {
        ...payment,
        amount: typeof payment.amount === "number" 
          ? payment.amount 
          : parseFloat(String(payment.amount || 0)) || 0,
      };
      setPayments((prevPayments) => {
        // Проверяем, нет ли уже такого платежа
        if (prevPayments.find((p) => p.id === normalizedPayment.id)) {
          return prevPayments;
        }
        return [normalizedPayment, ...prevPayments];
      });
    }, []),
    onPaymentUpdated: useCallback((payment: any) => {
      console.log('[Payments] WebSocket: Payment updated', payment);
      const normalizedPayment = {
        ...payment,
        amount: typeof payment.amount === "number" 
          ? payment.amount 
          : parseFloat(String(payment.amount || 0)) || 0,
      };
      setPayments((prevPayments) => {
        const index = prevPayments.findIndex((p) => p.id === normalizedPayment.id);
        if (index !== -1) {
          const newPayments = [...prevPayments];
          newPayments[index] = normalizedPayment;
          return newPayments;
        } else {
          return [...prevPayments, normalizedPayment];
        }
      });
    }, []),
  });

  const loadUsers = async () => {
    try {
      const data = await usersAPI.getAll();
      setUsers(data);
    } catch (err) {
      console.error("Error loading users:", err);
    }
  };

  const loadOrders = async () => {
    try {
      const data = await ordersAPI.getAll();
      setOrders(data);
    } catch (err) {
      console.error("Error loading orders:", err);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      pending: "Ожидание",
      processing: "Обработка",
      completed: "Завершен",
      failed: "Ошибка",
      refunded: "Возврат",
    };
    return labels[status] || status;
  };

  const getTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      order_payment: "Оплата заказа",
      commission: "Комиссия",
      withdrawal: "Вывод",
    };
    return labels[type] || type;
  };

  // Фильтрация платежей
  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchesSearch =
        searchTerm === "" ||
        payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
      const matchesType = typeFilter === "all" || payment.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [payments, searchTerm, statusFilter, typeFilter]);

  // Пагинация
  const paginatedPayments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredPayments.slice(startIndex, endIndex);
  }, [filteredPayments, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, typeFilter]);

  const handleCreate = () => {
    setSelectedPayment(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleEdit = (payment: Payment) => {
    setSelectedPayment(payment);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleSave = async (paymentData: any) => {
    try {
      if (modalMode === "create") {
        await paymentsAPI.create(paymentData);
      } else if (selectedPayment?.id) {
        await paymentsAPI.update(selectedPayment.id, paymentData);
      }
      setIsModalOpen(false);
      loadPayments();
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Ошибка сохранения платежа");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот платеж?")) {
      return;
    }

    try {
      await paymentsAPI.delete(id);
      loadPayments();
    } catch (err: any) {
      alert(err.response?.data?.message || "Ошибка удаления");
    }
  };

  // Экспорт отключен временно (кнопки экспорта не отображаются на странице)

  // Подсчет общей суммы
  const totalAmount = useMemo(() => {
    try {
      const sum = filteredPayments
        .filter((p) => p.status === "completed")
        .reduce((acc, p) => {
          const amount = typeof p.amount === "number" 
            ? p.amount 
            : parseFloat(String(p.amount || 0));
          return acc + (isNaN(amount) ? 0 : amount);
        }, 0);
      return typeof sum === "number" && !isNaN(sum) ? sum : 0;
    } catch (error) {
      console.error("Error calculating totalAmount:", error);
      return 0;
    }
  }, [filteredPayments]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-12">
            <p className="text-gray-600">Загрузка платежей...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Платежи</h2>
              <p className="text-gray-600 mt-2">
                Все платежи в системе
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              + Создать платеж
            </button>
          </div>

          {/* Общая статистика */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-4 text-white">
              <p className="text-sm font-medium text-green-100">Всего платежей</p>
              <p className="text-2xl font-bold mt-1">{filteredPayments.length}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-4 text-white">
              <p className="text-sm font-medium text-blue-100">Завершенных</p>
              <p className="text-2xl font-bold mt-1">
                {filteredPayments.filter((p) => p.status === "completed").length}
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-4 text-white">
              <p className="text-sm font-medium text-purple-100">Общая сумма</p>
              <p className="text-2xl font-bold mt-1">
                {(() => {
                  const num = typeof totalAmount === "number" && !isNaN(totalAmount) 
                    ? totalAmount 
                    : 0;
                  return num.toFixed(2);
                })()} ₽
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Поиск и фильтры */}
          <div className="mb-6 space-y-4">
            {/* Поиск */}
            <div>
              <input
                type="text"
                placeholder="Поиск по ID, описанию, транзакции..."
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
                  <option value="pending">Ожидание</option>
                  <option value="processing">Обработка</option>
                  <option value="completed">Завершен</option>
                  <option value="failed">Ошибка</option>
                  <option value="refunded">Возврат</option>
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Тип
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Все типы</option>
                  <option value="order_payment">Оплата заказа</option>
                  <option value="commission">Комиссия</option>
                  <option value="withdrawal">Вывод</option>
                </select>
              </div>

              {(searchTerm !== "" || statusFilter !== "all" || typeFilter !== "all") && (
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                      setTypeFilter("all");
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
                Найдено: {filteredPayments.length} из {payments.length}
                {filteredPayments.length !== payments.length && (
                  <span className="ml-2 text-blue-600">
                    (Экспорт будет применен к отфильтрованным данным)
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Тип
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
                  {paginatedPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-900">
                          {payment.id.substring(0, 8)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getTypeLabel(payment.type)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(payment.status)}`}
                        >
                          {getStatusLabel(payment.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {(() => {
                            try {
                              const amount = typeof payment.amount === "number" 
                                ? payment.amount 
                                : parseFloat(String(payment.amount || 0));
                              const numAmount = isNaN(amount) ? 0 : amount;
                              return typeof numAmount === "number" 
                                ? numAmount.toFixed(2) 
                                : "0.00";
                            } catch (error) {
                              console.error("Error formatting amount:", error, payment);
                              return "0.00";
                            }
                          })()} {payment.currency || "RUB"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(payment.createdAt).toLocaleDateString("ru-RU")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(payment)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Редактировать
                        </button>
                        <button
                          onClick={() => handleDelete(payment.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {paginatedPayments.length === 0 && !loading && (
                <div className="text-center py-12">
                  {payments.length === 0 ? (
                    <div>
                      <p className="text-gray-600 text-lg mb-2">Нет платежей</p>
                      <p className="text-sm text-gray-500">
                        Создайте первый платеж, нажав на кнопку "Создать платеж"
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-600 text-lg mb-2">Ничего не найдено</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Попробуйте изменить фильтры или поисковый запрос
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Пагинация */}
          {filteredPayments.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={filteredPayments.length}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(items) => {
                setItemsPerPage(items);
                setCurrentPage(1);
              }}
            />
          )}
        </div>
      </div>

      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        payment={selectedPayment}
        mode={modalMode}
        users={users}
        orders={orders}
      />
    </div>
  );
}

