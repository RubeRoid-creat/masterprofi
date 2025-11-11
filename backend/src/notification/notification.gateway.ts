import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({
  cors: {
    origin: (origin, callback) => {
      // Разрешаем все источники в development
      if (process.env.NODE_ENV === "development" || !origin) {
        return callback(null, true);
      }

      const allowedOrigins = [
        process.env.FRONTEND_URL || "http://localhost:5173",
        "http://localhost:19006",
        "http://localhost:8081",
        /^http:\/\/localhost:\d+$/,
        /^http:\/\/10\.0\.2\.2:\d+$/,
      ];

      const isAllowed = allowedOrigins.some((allowed) => {
        if (typeof allowed === "string") {
          return origin === allowed;
        }
        if (allowed instanceof RegExp) {
          return allowed.test(origin);
        }
        return false;
      });

      callback(null, isAllowed);
    },
    credentials: true,
  },
  transports: ["websocket", "polling"],
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  emitOrderCreated(order: any) {
    this.server.emit("order_created", order);
  }

  emitOrderStatusChanged(orderId: string, status: string, order?: any) {
    this.server.emit("order_status_changed", { 
      orderId, 
      status,
      order, // Полный объект заказа для синхронизации
    });
  }

  emitUpcomingOrder(userId: string, order: any, minutesUntil: number) {
    this.server.to(`user_${userId}`).emit("upcoming_order", {
      order,
      minutesUntil,
      message: `Напоминание: у вас запланирован заказ через ${minutesUntil} минут`,
    });
  }

  emitOrderBooked(order: any) {
    this.server.emit("order_booked", order);
  }

  // User events
  emitUserCreated(user: any) {
    this.server.emit("user_created", user);
  }

  emitUserUpdated(user: any) {
    this.server.emit("user_updated", user);
  }

  emitProfileUpdated(userId: string, profile: any) {
    this.server.emit("profile_updated", { userId, profile });
  }

  // Chat events
  emitChatMessageCreated(chatId: string, message: any) {
    this.server.emit("chat_message_created", { chatId, message });
  }

  emitChatUpdated(chat: any) {
    this.server.emit("chat_updated", chat);
  }

  // Payment events
  emitPaymentCreated(payment: any) {
    this.server.emit("payment_created", payment);
  }

  emitPaymentUpdated(payment: any) {
    this.server.emit("payment_updated", payment);
  }

  // Review events
  emitReviewCreated(review: any) {
    this.server.emit("review_created", review);
  }

  emitReviewUpdated(review: any) {
    this.server.emit("review_updated", review);
  }

  // MLM events
  emitMLMNetworkUpdated(userId: string, networkData: any) {
    this.server.emit("mlm_network_updated", { userId, networkData });
  }

  emitCommissionUpdated(userId: string, commission: any) {
    this.server.emit("commission_updated", { userId, commission });
  }

  // Schedule events
  emitScheduleUpdated(masterId: string, schedule: any) {
    this.server.emit("schedule_updated", { masterId, schedule });
  }

  // Generic data sync event
  emitDataSync(entityType: string, action: 'created' | 'updated' | 'deleted', data: any) {
    this.server.emit("data_sync", { entityType, action, data });
  }
}
