import { useEffect, useState } from "react";
import { ordersAPI } from "../services/api";

interface OrderHistory {
  id: string;
  action: string;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  description: string;
  createdAt: string;
  changedBy?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  metadata?: Record<string, any>;
}

interface OrderTimelineProps {
  orderId: string;
  filter?: "all" | "status" | "masters";
}

export default function OrderTimeline({ orderId, filter = "all" }: OrderTimelineProps) {
  const [history, setHistory] = useState<OrderHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadHistory();
  }, [orderId, filter]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      let data: OrderHistory[];
      
      if (filter === "status") {
        data = await ordersAPI.getStatusHistory(orderId);
      } else if (filter === "masters") {
        data = await ordersAPI.getMasterHistory(orderId);
      } else {
        data = await ordersAPI.getHistory(orderId);
      }
      
      setHistory(data);
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Ошибка загрузки истории");
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "created":
        return (
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
        );
      case "status_changed":
        return (
          <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
        );
      case "master_assigned":
      case "master_changed":
        return (
          <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        );
      case "amount_changed":
        return (
          <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
        );
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      created: "Создан",
      status_changed: "Изменен статус",
      master_assigned: "Назначен мастер",
      master_changed: "Изменен мастер",
      amount_changed: "Изменена сумма",
      description_changed: "Изменено описание",
      updated: "Обновлен",
    };
    return labels[action] || action;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ru-RU", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getUserName = (user?: OrderHistory["changedBy"]) => {
    if (!user) return "Система";
    if (user.firstName || user.lastName) {
      return `${user.firstName || ""} ${user.lastName || ""}`.trim();
    }
    return user.email;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Загрузка истории...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">История изменений отсутствует</p>
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {history.map((item, index) => (
          <li key={item.id}>
            <div className="relative pb-8">
              {index !== history.length - 1 && (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex space-x-3">
                {getActionIcon(item.action)}
                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {getActionLabel(item.action)}
                      </p>
                      <time className="text-xs text-gray-500">
                        {formatDate(item.createdAt)}
                      </time>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                    
                    {/* Показываем старые/новые значения если есть */}
                    {(item.oldValue || item.newValue) && (
                      <div className="mt-2 flex items-center space-x-2 text-xs">
                        {item.oldValue && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-red-100 text-red-800">
                            Было: {item.oldValue}
                          </span>
                        )}
                        {item.newValue && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-100 text-green-800">
                            Стало: {item.newValue}
                          </span>
                        )}
                      </div>
                    )}
                    
                    <p className="mt-1 text-xs text-gray-500">
                      Изменено: {getUserName(item.changedBy)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

