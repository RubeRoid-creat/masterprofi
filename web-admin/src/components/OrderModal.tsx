import { useState, useEffect } from "react";
import Calendar from "./Calendar";
import TimeSlotSelector from "./TimeSlotSelector";

declare global {
  interface Window {
    ymaps: any;
  }
}

interface Order {
  id?: string;
  clientId: string;
  totalAmount?: number;
  description?: string;
  status?: string;
  masterId?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  scheduledAt?: string;
}

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (order: Order) => void;
  order?: Order | null;
  mode: "create" | "edit";
  clients?: any[];
  masters?: any[];
}

export default function OrderModal({
  isOpen,
  onClose,
  onSave,
  order,
  mode,
  clients = [],
  masters = [],
}: OrderModalProps) {
  const [formData, setFormData] = useState<Order>({
    clientId: "",
    totalAmount: 0,
    description: "",
    status: "created",
    masterId: "",
    address: "",
    latitude: undefined,
    longitude: undefined,
    scheduledAt: undefined,
  });

  const [error, setError] = useState("");
  const [geocodingLoading, setGeocodingLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{
    startTime: Date;
    endTime: Date;
  } | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);

  useEffect(() => {
    if (order) {
      setFormData(order);
    } else {
      setFormData({
        clientId: "",
        totalAmount: 0,
        description: "",
        status: "created",
        masterId: "",
        address: "",
        latitude: undefined,
        longitude: undefined,
        scheduledAt: undefined,
      });
      setSelectedDate(null);
      setSelectedTimeSlot(null);
    }
  }, [order, isOpen]);

  useEffect(() => {
    if (selectedTimeSlot) {
      setFormData((prev) => ({
        ...prev,
        scheduledAt: selectedTimeSlot.startTime.toISOString(),
      }));
    }
  }, [selectedTimeSlot]);

  const geocodeAddress = async () => {
    if (!formData.address) return;
    
    if (!window.ymaps) {
      setError("Yandex Maps API не загружен. Введите координаты вручную.");
      return;
    }

    setGeocodingLoading(true);
    try {
      await window.ymaps.geocode(formData.address, {
        results: 1,
      }).then((result: any) => {
        const firstGeoObject = result.geoObjects.get(0);
        if (firstGeoObject) {
          const coords = firstGeoObject.geometry.getCoordinates();
          setFormData({
            ...formData,
            latitude: coords[0],
            longitude: coords[1],
          });
        } else {
          setError("Адрес не найден. Введите координаты вручную.");
        }
      });
    } catch (err) {
      console.error("Geocoding error:", err);
      setError("Ошибка геокодирования. Введите координаты вручную.");
    } finally {
      setGeocodingLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "create" && !formData.clientId) {
      setError("Клиент обязателен");
      return;
    }

    onSave(formData);
  };

  const statusOptions = [
    { value: "created", label: "Создан" },
    { value: "assigned", label: "Назначен" },
    { value: "in_progress", label: "В работе" },
    { value: "completed", label: "Завершен" },
    { value: "cancelled", label: "Отменен" },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-10">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg my-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {mode === "create" ? "Создать заказ" : "Редактировать заказ"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-2xl"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "create" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Клиент *
              </label>
              <select
                value={formData.clientId}
                onChange={(e) =>
                  setFormData({ ...formData, clientId: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Выберите клиента</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.firstName && client.lastName
                      ? `${client.firstName} ${client.lastName}`
                      : client.email}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Мастер
            </label>
            <select
              value={formData.masterId || ""}
              onChange={(e) =>
                setFormData({ ...formData, masterId: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Без мастера</option>
              {masters.map((master) => (
                <option key={master.id} value={master.id}>
                  {master.firstName && master.lastName
                    ? `${master.firstName} ${master.lastName}`
                    : master.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Статус
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Описание
            </label>
            <textarea
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Опишите детали заказа..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Сумма (₽)
            </label>
            <input
              type="number"
              value={formData.totalAmount || 0}
              onChange={(e) =>
                setFormData({ ...formData, totalAmount: parseFloat(e.target.value) || 0 })
              }
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Адрес
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.address || ""}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Введите адрес..."
              />
              <button
                type="button"
                onClick={geocodeAddress}
                disabled={geocodingLoading || !formData.address}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {geocodingLoading ? "..." : "📍"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Широта
              </label>
              <input
                type="number"
                value={formData.latitude || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    latitude: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
                step="any"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="55.7558"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Долгота
              </label>
              <input
                type="number"
                value={formData.longitude || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    longitude: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
                step="any"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="37.6173"
              />
            </div>
          </div>

          {/* Расписание */}
          {mode === "create" && formData.masterId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Запланировать время выполнения
              </label>
              <button
                type="button"
                onClick={() => setShowSchedule(!showSchedule)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
              >
                {selectedTimeSlot
                  ? `Выбрано: ${selectedTimeSlot.startTime.toLocaleString("ru-RU")}`
                  : "Выбрать дату и время"}
              </button>
              {showSchedule && (
                <div className="mt-4 space-y-4 max-h-96 overflow-y-auto">
                  <Calendar
                    selectedDate={selectedDate || undefined}
                    onDateSelect={(date) => {
                      setSelectedDate(date);
                      setSelectedTimeSlot(null);
                    }}
                    minDate={new Date()}
                  />
                  {selectedDate && (
                    <TimeSlotSelector
                      masterId={formData.masterId}
                      selectedDate={selectedDate}
                      onSlotSelect={(startTime, endTime) => {
                        setSelectedTimeSlot({ startTime, endTime });
                      }}
                      selectedSlot={selectedTimeSlot || undefined}
                    />
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
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
