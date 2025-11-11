import { useState, useEffect } from "react";

interface Payment {
  id?: string;
  userId: string;
  type: string;
  status: string;
  amount: number;
  currency?: string;
  description?: string;
  orderId?: string;
  transactionId?: string;
  gateway?: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payment: Payment) => void;
  payment?: Payment | null;
  mode: "create" | "edit";
  users?: any[];
  orders?: any[];
}

export default function PaymentModal({
  isOpen,
  onClose,
  onSave,
  payment,
  mode,
  users = [],
  orders = [],
}: PaymentModalProps) {
  const [formData, setFormData] = useState<Payment>({
    userId: "",
    type: "order_payment",
    status: "pending",
    amount: 0,
    currency: "RUB",
    description: "",
    orderId: "",
    transactionId: "",
    gateway: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (payment) {
      setFormData(payment);
    } else {
      setFormData({
        userId: "",
        type: "order_payment",
        status: "pending",
        amount: 0,
        currency: "RUB",
        description: "",
        orderId: "",
        transactionId: "",
        gateway: "",
      });
    }
  }, [payment, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.userId) {
      setError("Пользователь обязателен");
      return;
    }

    if (formData.amount <= 0) {
      setError("Сумма должна быть больше 0");
      return;
    }

    onSave(formData);
  };

  const typeOptions = [
    { value: "order_payment", label: "Оплата заказа" },
    { value: "commission", label: "Комиссия" },
    { value: "withdrawal", label: "Вывод средств" },
  ];

  const statusOptions = [
    { value: "pending", label: "Ожидание" },
    { value: "processing", label: "Обработка" },
    { value: "completed", label: "Завершен" },
    { value: "failed", label: "Ошибка" },
    { value: "refunded", label: "Возврат" },
  ];

  const gatewayOptions = [
    { value: "stripe", label: "Stripe" },
    { value: "yookassa", label: "YooKassa" },
    { value: "sberbank", label: "Сбербанк" },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-10">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg my-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {mode === "create" ? "Создать платеж" : "Редактировать платеж"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Пользователь *
            </label>
            <select
              value={formData.userId}
              onChange={(e) =>
                setFormData({ ...formData, userId: e.target.value })
              }
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Выберите пользователя</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.email}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Тип платежа
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {typeOptions.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Статус
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Сумма *
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })
                }
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Валюта
              </label>
              <select
                value={formData.currency}
                onChange={(e) =>
                  setFormData({ ...formData, currency: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="RUB">RUB</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание
            </label>
            <textarea
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Описание платежа..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID заказа
            </label>
            <select
              value={formData.orderId || ""}
              onChange={(e) =>
                setFormData({ ...formData, orderId: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Не выбран</option>
              {orders.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.id.substring(0, 8)}... - {order.description?.substring(0, 20) || "без описания"}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID транзакции
              </label>
              <input
                type="text"
                value={formData.transactionId || ""}
                onChange={(e) =>
                  setFormData({ ...formData, transactionId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="txn_..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Платежный шлюз
              </label>
              <select
                value={formData.gateway || ""}
                onChange={(e) =>
                  setFormData({ ...formData, gateway: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Не выбран</option>
                {gatewayOptions.map((gw) => (
                  <option key={gw.value} value={gw.value}>
                    {gw.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {mode === "create" ? "Создать" : "Сохранить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

