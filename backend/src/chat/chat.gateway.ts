import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { UseGuards } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { CreateMessageDto } from "./dto/create-message.dto";
import { MessageType } from "./entities/message.entity";
import { JwtService } from "@nestjs/jwt";

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

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
  namespace: "/chat",
  transports: ["websocket", "polling"],
})
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Получаем токен из query или handshake auth
      const token =
        client.handshake.auth?.token ||
        client.handshake.query?.token?.toString() ||
        client.handshake.headers?.authorization?.replace("Bearer ", "");

      if (!token) {
        client.disconnect();
        return;
      }

      // Проверяем токен
      const payload = await this.jwtService.verifyAsync(token);
      client.userId = payload.sub || payload.id;

      if (!client.userId) {
        client.disconnect();
        return;
      }

      // Сохраняем связь userId -> socketId
      this.connectedUsers.set(client.userId, client.id);

      console.log(`Chat client connected: ${client.id} (user: ${client.userId})`);
    } catch (error) {
      console.error("Chat authentication error:", error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.connectedUsers.delete(client.userId);
    }
    console.log(`Chat client disconnected: ${client.id}`);
  }

  @SubscribeMessage("join_chat")
  async handleJoinChat(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string }
  ) {
    if (!client.userId) {
      return { error: "Unauthorized" };
    }

    try {
      // Проверяем доступ к чату
      await this.chatService.getChatById(data.chatId, client.userId);

      // Присоединяемся к комнате чата
      client.join(`chat_${data.chatId}`);
      console.log(`User ${client.userId} joined chat ${data.chatId}`);

      // Отмечаем сообщения как прочитанные
      await this.chatService.markAsRead(data.chatId, client.userId);

      return { success: true, chatId: data.chatId };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  @SubscribeMessage("leave_chat")
  async handleLeaveChat(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string }
  ) {
    client.leave(`chat_${data.chatId}`);
    return { success: true };
  }

  @SubscribeMessage("send_message")
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() createMessageDto: CreateMessageDto
  ) {
    if (!client.userId) {
      return { error: "Unauthorized" };
    }

    try {
      // Создаем сообщение
      const message = await this.chatService.createMessage(
        createMessageDto,
        client.userId
      );

      // Отправляем сообщение всем участникам чата
      this.server.to(`chat_${createMessageDto.chatId}`).emit("new_message", {
        message,
        chatId: createMessageDto.chatId,
      });

      // Получаем чат для отправки обновления
      const chat = await this.chatService.getChatById(
        createMessageDto.chatId,
        client.userId
      );

      // Отправляем обновление чата всем участникам
      const participants = [chat.clientId, chat.masterId].filter(Boolean);
      participants.forEach((userId) => {
        const socketId = this.connectedUsers.get(userId);
        if (socketId) {
          this.server.to(socketId).emit("chat_updated", {
            chatId: chat.id,
            lastMessage: message,
          });
        }
      });

      return { success: true, message };
    } catch (error: any) {
      console.error("Error sending message:", error);
      return { error: error.message };
    }
  }

  @SubscribeMessage("typing")
  async handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string; isTyping: boolean }
  ) {
    if (!client.userId) return;

    // Отправляем событие всем в чате, кроме отправителя
    client.to(`chat_${data.chatId}`).emit("user_typing", {
      userId: client.userId,
      chatId: data.chatId,
      isTyping: data.isTyping,
    });
  }

  // Метод для отправки системных сообщений
  async sendSystemMessage(
    chatId: string,
    content: string,
    orderId?: string
  ): Promise<void> {
    const message = await this.chatService.createMessage(
      {
        chatId,
        content,
        type: "system" as any,
      },
      "system"
    );

    this.server.to(`chat_${chatId}`).emit("new_message", {
      message,
      chatId,
    });
  }
}

