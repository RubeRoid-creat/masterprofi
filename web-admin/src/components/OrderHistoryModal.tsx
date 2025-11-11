import { useState } from "react";
import OrderTimeline from "./OrderTimeline";

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderNumber?: string;
}

export default function OrderHistoryModal({
  isOpen,
  onClose,
  orderId,
  orderNumber,
}: OrderHistoryModalProps) {
  const [filter, setFilter] = useState<"all" | "status" | "masters">("all");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              История изменений заказа
            </h3>
            {orderNumber && (
              <p className="text-sm text-gray-600">Заказ #{orderNumber}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Фильтры */}
        <div className="mb-4 flex space-x-2 border-b pb-4">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Вся история
          </button>
          <button
            onClick={() => setFilter("status")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === "status"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            История статусов
          </button>
          <button
            onClick={() => setFilter("masters")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === "masters"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            История мастеров
          </button>
        </div>

        {/* Временная шкала */}
        <div className="max-h-96 overflow-y-auto">
          <OrderTimeline orderId={orderId} filter={filter} />
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}

