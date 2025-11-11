import { useState, useEffect, useMemo } from "react";
import Calendar from "../components/Calendar";
import { scheduleAPI } from "../services/api";
import { useAppSelector } from "../store/hooks";

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  status: "available" | "booked" | "blocked";
  orderId?: string;
}

export default function Schedule() {
  const { user } = useAppSelector((state) => state.auth);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Отладочная информация
  useEffect(() => {
    console.log("Schedule component mounted", { user, isMaster: user?.role === "master" });
  }, [user]);

  // Настройки генерации
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0]
  );
  const [slotDuration, setSlotDuration] = useState<number>(60);
  const [workingHours, setWorkingHours] = useState({
    start: "09:00",
    end: "18:00",
  });

  const isMaster = user?.role === "master";
  const masterId = isMaster ? user.id : null;

  const loadSlots = async () => {
    if (!masterId) return;

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
        false // все слоты, не только доступные
      );

      setSlots(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Error loading slots:", err);
      setError(err.response?.data?.message || "Ошибка загрузки слотов");
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  // Вычисляем доступные и занятые даты из слотов
  const availableDates = useMemo(() => {
    const dates = new Set<string>();
    slots.forEach((slot) => {
      const date = new Date(slot.startTime);
      date.setHours(0, 0, 0, 0);
      dates.add(date.toISOString());
    });
    return Array.from(dates).map((d) => new Date(d));
  }, [slots]);

  const bookedDates = useMemo(() => {
    return slots
      .filter((s) => s.status === "booked")
      .map((s) => {
        const date = new Date(s.startTime);
        date.setHours(0, 0, 0, 0);
        return date;
      });
  }, [slots]);

  useEffect(() => {
    if (masterId && selectedDate) {
      loadSlots();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [masterId, selectedDate]);

  const generateSlots = async () => {
    if (!masterId) {
      setError("Вы должны быть мастером для настройки расписания");
      return;
    }

    setGenerating(true);
    setError("");
    setSuccess("");

    try {
      await scheduleAPI.generateSlots({
        masterId,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        slotDurationMinutes: slotDuration,
        workingHours,
      });

      setSuccess(
        `Слоты успешно созданы с ${startDate} по ${endDate}`
      );
      loadSlots(); // Обновляем список слотов
    } catch (err: any) {
      console.error("Error generating slots:", err);
      setError(
        err.response?.data?.message ||
          "Ошибка при создании слотов расписания"
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleBlockSlot = async (slotId: string) => {
    try {
      await scheduleAPI.blockSlot(slotId);
      setSuccess("Слот заблокирован");
      loadSlots();
    } catch (err: any) {
      setError(err.response?.data?.message || "Ошибка при блокировке слота");
    }
  };

  const handleUnblockSlot = async (slotId: string) => {
    try {
      await scheduleAPI.unblockSlot(slotId);
      setSuccess("Слот разблокирован");
      loadSlots();
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Ошибка при разблокировке слота"
      );
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "booked":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "blocked":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "available":
        return "Доступен";
      case "booked":
        return "Забронирован";
      case "blocked":
        return "Заблокирован";
      default:
        return status;
    }
  };

  // Проверка, что пользователь загружен
  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <p className="text-gray-600 dark:text-gray-400">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!isMaster) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Расписание
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Эта страница доступна только для мастеров. Ваша роль: {user.role}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Расписание
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Настройте свое рабочее расписание и управляйте доступностью
            </p>
            {masterId && (
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                ID мастера: {masterId}
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          {/* Генерация слотов */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Генерация слотов расписания
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Дата начала
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Дата окончания
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Длительность слота (минуты)
                </label>
                <input
                  type="number"
                  value={slotDuration}
                  onChange={(e) => setSlotDuration(parseInt(e.target.value) || 60)}
                  min="15"
                  max="240"
                  step="15"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Начало рабочего дня
                  </label>
                  <input
                    type="time"
                    value={workingHours.start}
                    onChange={(e) =>
                      setWorkingHours({ ...workingHours, start: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Конец рабочего дня
                  </label>
                  <input
                    type="time"
                    value={workingHours.end}
                    onChange={(e) =>
                      setWorkingHours({ ...workingHours, end: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={generateSlots}
              disabled={generating}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {generating ? "Создание слотов..." : "Создать слоты"}
            </button>
          </div>

          {/* Календарь и список слотов */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Календарь */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Выберите дату
              </h3>
              <Calendar
                selectedDate={selectedDate}
                onDateSelect={(date) => setSelectedDate(date)}
                minDate={new Date()}
                availableDates={availableDates}
                bookedDates={bookedDates}
              />
            </div>

            {/* Слоты на выбранную дату */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Слоты на {selectedDate.toLocaleDateString("ru-RU")}
              </h3>

              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Загрузка слотов...
                  </p>
                </div>
              ) : slots.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-gray-600 dark:text-gray-400">
                    Нет слотов на эту дату
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    Используйте форму выше для создания слотов
                  </p>
                  <button
                    onClick={() => loadSlots()}
                    className="mt-4 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800/50"
                  >
                    Обновить
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {slots.map((slot) => (
                    <div
                      key={slot.id}
                      className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {formatTime(slot.startTime)} -{" "}
                            {formatTime(slot.endTime)}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                              slot.status
                            )}`}
                          >
                            {getStatusLabel(slot.status)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {slot.status === "available" && (
                          <button
                            onClick={() => handleBlockSlot(slot.id)}
                            className="px-3 py-1 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800/50"
                            title="Заблокировать слот"
                          >
                            Заблокировать
                          </button>
                        )}
                        {slot.status === "blocked" && (
                          <button
                            onClick={() => handleUnblockSlot(slot.id)}
                            className="px-3 py-1 text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-800/50"
                            title="Разблокировать слот"
                          >
                            Разблокировать
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

