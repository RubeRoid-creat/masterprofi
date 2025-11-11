import { useEffect, useRef } from "react";
import { socketService } from "../services/socket";
import { useNotifications } from "../contexts/NotificationContext";
import { useAppSelector } from "../store/hooks";

export const useSocket = () => {
  const { showNotification } = useNotifications();
  const { token } = useAppSelector((state) => state.auth);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!token || isInitialized.current) {
      return;
    }

    // Подключаемся к Socket.io
    const socket = socketService.connect(token);
    if (!socket) return;

    // Обработка новых заказов (используем события, которые отправляет бэкенд)
    socketService.on("order_created", (order: any) => {
      console.log("[Socket] New order created:", order);
      showNotification({
        type: "info",
        title: "Новый заказ",
        message: `Создан заказ #${order.id?.substring(0, 8) || "unknown"} на сумму ${order.totalAmount || 0} ₽`,
        duration: 7000,
      });
      
      // Также эмитим событие для совместимости с Orders.tsx
      socket.emit("order:created", order);
    });

    // Обработка изменения статуса заказа
    socketService.on("order_status_changed", (data: { orderId: string; status: string; order?: any }) => {
      console.log("[Socket] Order status changed:", data);
      
      const statusMessages: Record<string, string> = {
        created: "создан",
        assigned: "назначен мастеру",
        in_progress: "в работе",
        completed: "завершен",
        cancelled: "отменен",
      };

      showNotification({
        type: data.status === "completed" ? "success" : "info",
        title: "Статус заказа изменен",
        message: `Заказ #${data.orderId?.substring(0, 8) || "unknown"} - ${statusMessages[data.status] || data.status}`,
        duration: 5000,
      });
      
      // Также эмитим событие для совместимости с Orders.tsx
      if (data.order) {
        socket.emit("order:updated", data.order);
      }
    });

    isInitialized.current = true;

    // Очистка при размонтировании
    return () => {
      socketService.disconnect();
      isInitialized.current = false;
    };
  }, [token, showNotification]);

  // Возвращаем socket для использования в компонентах
  // Возвращаем сам socket, а не сервис, для совместимости с Orders.tsx
  const socket = socketService.getSocket();
  return socket?.connected ? socket : null;
};


