import { useState, useEffect } from "react";
import { ordersAPI } from "../../services/api";
import OrderCard from "./components/OrderCard";

const STATUSES = [
  { id: "new", name: "Новые", color: "bg-gray-100" },
  { id: "assigned", name: "Назначенные", color: "bg-blue-100" },
  { id: "in_progress", name: "В работе", color: "bg-yellow-100" },
  { id: "completed", name: "Завершенные", color: "bg-green-100" },
  { id: "cancelled", name: "Отмененные", color: "bg-red-100" },
];

export default function KanbanBoard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await ordersAPI.getAll();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("Failed to load orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getOrdersByStatus = (status: string) => {
    return orders.filter((order) => order.status === status);
  };

  return (
    <div>
      {loading && (
        <div className="mb-4 text-gray-600">Загрузка...</div>
      )}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Доска заказов
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Управление заказами в режиме Kanban
        </p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUSES.map((status) => (
          <div
            key={status.id}
            className={`flex-shrink-0 w-80 ${status.color} rounded-lg p-4`}
          >
            <h3 className="font-semibold mb-4">{status.name}</h3>
            <div className="space-y-2">
              {getOrdersByStatus(status.id).map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

