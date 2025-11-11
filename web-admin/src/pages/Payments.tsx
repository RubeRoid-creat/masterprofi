import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import PaymentModal from "../components/PaymentModal";
import Pagination from "../components/Pagination";
import { paymentsAPI, usersAPI, ordersAPI } from "../services/api";
import { useDataSync } from "../hooks/useDataSync";
import { Button, Card, Badge, Input, Select, StatCard, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Alert, LoadingSpinner, MobileTableCard } from "../components/ui";

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

  const getStatusBadgeVariant = (status: string): "primary" | "secondary" | "success" | "warning" | "error" | "info" | "gray" => {
    switch (status) {
      case "completed":
        return "success";
      case "processing":
        return "primary";
      case "pending":
        return "warning";
      case "failed":
        return "error";
      case "refunded":
        return "info";
      default:
        return "gray";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "order_payment":
        return "Оплата заказа";
      case "commission":
        return "Комиссия";
      case "withdrawal":
        return "Вывод";
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Card variant="elevated" padding="lg" className="animate-slide-up">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 font-display">Платежи</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Все платежи в системе
            </p>
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
            Создать платеж
          </Button>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 animate-fade-in">
          <StatCard
            title="Всего платежей"
            value={filteredPayments.length}
            variant="primary"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            className="animate-slide-up"
            style={{ animationDelay: '0.1s' }}
          />
          <StatCard
            title="Завершенных"
            value={filteredPayments.filter((p) => p.status === "completed").length}
            variant="success"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            className="animate-slide-up"
            style={{ animationDelay: '0.2s' }}
          />
          <StatCard
            title="Общая сумма"
            value={(() => {
              const num = typeof totalAmount === "number" && !isNaN(totalAmount) 
                ? totalAmount 
                : 0;
              return `${num.toFixed(2)} ₽`;
            })()}
            variant="secondary"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
            className="animate-slide-up"
            style={{ animationDelay: '0.3s' }}
          />
        </div>

        {error && (
          <Alert
            variant="error"
            onClose={() => setError("")}
            className="mb-6 animate-slide-up"
          >
            {error}
          </Alert>
        )}

        {/* Поиск и фильтры */}
        <div className="mb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              type="text"
              placeholder="Поиск по ID, описанию, транзакции..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />

            <Select
              label="Статус"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "all", label: "Все статусы" },
                { value: "pending", label: "Ожидание" },
                { value: "processing", label: "Обработка" },
                { value: "completed", label: "Завершен" },
                { value: "failed", label: "Ошибка" },
                { value: "refunded", label: "Возврат" },
              ]}
            />

            <Select
              label="Тип"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={[
                { value: "all", label: "Все типы" },
                { value: "order_payment", label: "Оплата заказа" },
                { value: "commission", label: "Комиссия" },
                { value: "withdrawal", label: "Вывод" },
              ]}
            />

            {(searchTerm !== "" || statusFilter !== "all" || typeFilter !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setTypeFilter("all");
                }}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                }
                className="sm:col-span-2 lg:col-span-1"
              >
                Сбросить
              </Button>
            )}
          </div>

          {/* Счетчик результатов */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Найдено: <span className="font-semibold text-gray-900 dark:text-gray-100">{filteredPayments.length}</span> из <span className="font-semibold text-gray-900 dark:text-gray-100">{payments.length}</span>
              {filteredPayments.length !== payments.length && (
                <Badge variant="info" size="sm" className="ml-2">
                  Экспорт к отфильтрованным данным
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Cards View */}
        <div className="block md:hidden space-y-4">
          {paginatedPayments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                {payments.length === 0
                  ? "Нет платежей. Создайте первый платеж, нажав на кнопку выше."
                  : "Ничего не найдено. Попробуйте изменить фильтры."}
              </p>
            </div>
          ) : (
            paginatedPayments.map((payment) => {
              const amount = typeof payment.amount === "number"
                ? payment.amount
                : parseFloat(String(payment.amount || 0)) || 0;
              return (
                <MobileTableCard
                  key={payment.id}
                  title={getTypeLabel(payment.type)}
                  subtitle={`ID: ${payment.id.substring(0, 8)}...`}
                  badge={
                    <Badge variant={getStatusBadgeVariant(payment.status)} size="sm">
                      {getStatusLabel(payment.status)}
                    </Badge>
                  }
                  fields={[
                    {
                      label: "Сумма",
                      value: `${amount.toFixed(2)} ${payment.currency || "RUB"}`,
                    },
                    {
                      label: "Дата",
                      value: new Date(payment.createdAt).toLocaleDateString("ru-RU"),
                    },
                  ]}
                  actions={
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(payment)}
                        title="Редактировать"
                        leftIcon={
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        }
                      >
                        Редактировать
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(payment.id)}
                        className="text-error-600 hover:text-error-700"
                        title="Удалить"
                        leftIcon={
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        }
                      >
                        Удалить
                      </Button>
                    </>
                  }
                  onClick={() => handleEdit(payment)}
                />
              );
            })
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Сумма</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">
                      {payments.length === 0
                        ? "Нет платежей. Создайте первый платеж, нажав на кнопку выше."
                        : "Ничего не найдено. Попробуйте изменить фильтры."}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPayments.map((payment) => {
                  const amount = typeof payment.amount === "number"
                    ? payment.amount
                    : parseFloat(String(payment.amount || 0)) || 0;
                  return (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div className="text-sm font-mono text-gray-900 dark:text-gray-100">
                          {payment.id.substring(0, 8)}...
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {getTypeLabel(payment.type)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(payment.status)} size="sm">
                          {getStatusLabel(payment.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {amount.toFixed(2)} {payment.currency || "RUB"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(payment.createdAt).toLocaleDateString("ru-RU")}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(payment)}
                          >
                            Редактировать
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(payment.id)}
                            className="text-error-600 hover:text-error-700"
                          >
                            Удалить
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Пагинация */}
        {filteredPayments.length > 0 && (
          <div className="mt-6">
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
          </div>
        )}
      </Card>

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

