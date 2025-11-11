import { useState, useEffect } from "react";
import { scheduleAPI } from "../services/api";

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  status: "available" | "booked" | "blocked";
}

interface TimeSlotSelectorProps {
  masterId: string;
  selectedDate: Date;
  onSlotSelect: (startTime: Date, endTime: Date) => void;
  selectedSlot?: { startTime: Date; endTime: Date };
}

export default function TimeSlotSelector({
  masterId,
  selectedDate,
  onSlotSelect,
  selectedSlot,
}: TimeSlotSelectorProps) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (masterId && selectedDate) {
      loadSlots();
    }
  }, [masterId, selectedDate]);

  const loadSlots = async () => {
    if (!masterId || !selectedDate) return;

    setLoading(true);
    setError("");
    try {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const data = await scheduleAPI.getMasterSlots(
        masterId,
        startOfDay.toISOString(),
        endOfDay.toISOString(),
        true // только доступные
      );

      setSlots(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Error loading slots:", err);
      setError("Ошибка загрузки слотов");
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isSlotSelected = (slot: TimeSlot) => {
    if (!selectedSlot) return false;
    const slotStart = new Date(slot.startTime);
    return slotStart.getTime() === selectedSlot.startTime.getTime();
  };

  const handleSlotClick = (slot: TimeSlot) => {
    if (slot.status !== "available") return;

    const startTime = new Date(slot.startTime);
    const endTime = new Date(slot.endTime);

    onSlotSelect(startTime, endTime);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">
          Загрузка доступных слотов...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">
          Нет доступных слотов на выбранную дату
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
          Мастер может создать слоты в своем расписании
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Выберите время
      </h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {slots.map((slot) => (
          <button
            key={slot.id}
            onClick={() => handleSlotClick(slot)}
            disabled={slot.status !== "available"}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              isSlotSelected(slot)
                ? "bg-blue-600 text-white"
                : slot.status === "available"
                ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800/50"
                : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed"
            }`}
          >
            {formatTime(slot.startTime)}
          </button>
        ))}
      </div>
      {selectedSlot && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-semibold">Выбрано:</span>{" "}
            {formatTime(selectedSlot.startTime.toISOString())} -{" "}
            {formatTime(selectedSlot.endTime.toISOString())}
          </p>
        </div>
      )}
    </div>
  );
}

