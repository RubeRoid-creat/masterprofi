import { useState, useEffect, useMemo } from "react";
import Calendar from "../components/Calendar";
import { scheduleAPI } from "../services/api";
import { useAppSelector } from "../store/hooks";
import { Button, Card, Input, Alert, Badge, LoadingSpinner } from "../components/ui";

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

  const getStatusBadgeVariant = (status: string): "primary" | "secondary" | "success" | "warning" | "error" | "info" | "gray" => {
    switch (status) {
      case "available":
        return "success";
      case "booked":
        return "primary";
      case "blocked":
        return "error";
      default:
        return "gray";
    }
  };

  // Проверка, что пользователь загружен
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isMaster) {
    return (
      <Card variant="elevated" padding="lg">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 font-display">
          Расписание
        </h2>
        <Alert variant="warning">
          Эта страница доступна только для мастеров. Ваша роль: {user.role}
        </Alert>
      </Card>
    );
  }

  return (
    <div className="animate-fade-in">
      <Card variant="elevated" padding="lg" className="animate-slide-up">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 font-display">
            Расписание
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Настройте свое рабочее расписание и управляйте доступностью
          </p>
          {masterId && (
            <Badge variant="info" size="sm" className="mt-2">
              ID мастера: {masterId.substring(0, 8)}...
            </Badge>
          )}
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

        {success && (
          <Alert
            variant="success"
            onClose={() => setSuccess("")}
            className="mb-6 animate-slide-up"
          >
            {success}
          </Alert>
        )}

        {/* Генерация слотов */}
        <Card variant="flat" padding="lg" className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Генерация слотов расписания
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Input
              type="date"
              label="Дата начала"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <Input
              type="date"
              label="Дата окончания"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />

            <Input
              type="number"
              label="Длительность слота (минуты)"
              value={slotDuration}
              onChange={(e) => setSlotDuration(parseInt(e.target.value) || 60)}
              min="15"
              max="240"
              step="15"
              helperText="От 15 до 240 минут, шаг 15"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                type="time"
                label="Начало рабочего дня"
                value={workingHours.start}
                onChange={(e) =>
                  setWorkingHours({ ...workingHours, start: e.target.value })
                }
              />

              <Input
                type="time"
                label="Конец рабочего дня"
                value={workingHours.end}
                onChange={(e) =>
                  setWorkingHours({ ...workingHours, end: e.target.value })
                }
              />
            </div>
          </div>

          <Button
            variant="primary"
            onClick={generateSlots}
            isLoading={generating}
            leftIcon={
              !generating && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              )
            }
          >
            {generating ? "Создание слотов..." : "Создать слоты"}
          </Button>
        </Card>

        {/* Календарь и список слотов */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Календарь */}
          <Card variant="outlined" padding="md">
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
          </Card>

          {/* Слоты на выбранную дату */}
          <Card variant="outlined" padding="md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Слоты на {selectedDate.toLocaleDateString("ru-RU")}
            </h3>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <LoadingSpinner size="lg" />
                <p className="text-gray-600 dark:text-gray-400 mt-4">
                  Загрузка слотов...
                </p>
              </div>
            ) : slots.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Нет слотов на эту дату
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                  Используйте форму выше для создания слотов
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadSlots()}
                  leftIcon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  }
                >
                  Обновить
                </Button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {slots.map((slot) => (
                  <Card
                    key={slot.id}
                    variant="outlined"
                    padding="sm"
                    className="flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                        </span>
                        <Badge variant={getStatusBadgeVariant(slot.status)} size="sm">
                          {getStatusLabel(slot.status)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {slot.status === "available" && (
                        <Button
                          variant="error"
                          size="sm"
                          onClick={() => handleBlockSlot(slot.id)}
                          title="Заблокировать слот"
                        >
                          Заблокировать
                        </Button>
                      )}
                      {slot.status === "blocked" && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleUnblockSlot(slot.id)}
                          title="Разблокировать слот"
                        >
                          Разблокировать
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </div>
      </Card>
    </div>
  );
}

