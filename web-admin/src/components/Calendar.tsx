import { useState, useEffect } from "react";

interface CalendarProps {
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
  availableDates?: Date[];
  bookedDates?: Date[];
  minDate?: Date;
  maxDate?: Date;
}

export default function Calendar({
  selectedDate,
  onDateSelect,
  availableDates = [],
  bookedDates = [],
  minDate,
  maxDate,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(
    selectedDate || new Date()
  );
  const [selected, setSelected] = useState<Date | null>(
    selectedDate || null
  );

  useEffect(() => {
    if (selectedDate) {
      setCurrentMonth(selectedDate);
      setSelected(selectedDate);
    }
  }, [selectedDate]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const days = [];
  const startDate = firstDayWeek === 0 ? 6 : firstDayWeek - 1; // Понедельник = 0

  // Пустые ячейки до первого дня месяца
  for (let i = 0; i < startDate; i++) {
    days.push(null);
  }

  // Дни месяца
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day));
  }

  const isDateAvailable = (date: Date) => {
    if (availableDates.length === 0) return false;
    const dateStr = date.toDateString();
    return availableDates.some(
      (d) => d.toDateString() === dateStr
    );
  };

  const isDateBooked = (date: Date) => {
    const dateStr = date.toDateString();
    return bookedDates.some((d) => d.toDateString() === dateStr);
  };

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    if (date < today) return true;
    return false;
  };

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return;
    setSelected(date);
    onDateSelect(date);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const monthNames = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
  ];

  const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {monthNames[month]} {year}
        </h3>
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-gray-700 dark:text-gray-300 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          if (!date) {
            return <div key={index} className="aspect-square" />;
          }

          const isSelected =
            selected && date.toDateString() === selected.toDateString();
          const isToday = date.toDateString() === today.toDateString();
          const isAvailable = isDateAvailable(date);
          const isBooked = isDateBooked(date);
          const isDisabled = isDateDisabled(date);

          return (
            <button
              key={index}
              onClick={() => handleDateClick(date)}
              disabled={isDisabled}
              className={`aspect-square rounded-md text-sm font-medium transition-colors ${
                isSelected
                  ? "bg-blue-600 text-white"
                  : isBooked
                  ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                  : isAvailable
                  ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800/50"
                  : isDisabled
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                  : "bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              } ${isToday && !isSelected ? "ring-2 ring-blue-400" : ""}`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-100 dark:bg-green-900/30 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">Доступно</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-100 dark:bg-red-900/30 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">Занято</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-600 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">Выбрано</span>
        </div>
      </div>
    </div>
  );
}

