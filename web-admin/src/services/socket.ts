import { io, Socket } from "socket.io-client";

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(token?: string) {
    if (this.socket?.connected) {
      return this.socket;
    }

    // Не подключаемся если нет токена
    if (!token) {
      console.log("Socket.io: Skipping connection - no token available");
      return null;
    }

    const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
    
    // Убираем /api из URL для Socket.io, так как он работает на корневом пути
    const socketUrl = backendUrl.replace(/\/api$/, "");

    try {
      this.socket = io(socketUrl, {
        transports: ["websocket", "polling"],
        auth: { token },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: this.maxReconnectAttempts,
        timeout: 5000,
        forceNew: false,
      });

      this.socket.on("connect", () => {
        console.log("✅ Socket.io connected:", this.socket?.id);
        this.reconnectAttempts = 0;
      });

      this.socket.on("disconnect", (reason) => {
        console.log("❌ Socket.io disconnected:", reason);
      });

      this.socket.on("connect_error", (_error) => {
        // Не критичная ошибка, просто логируем (только один раз, чтобы не засорять консоль)
        if (this.reconnectAttempts === 0) {
          console.log("Socket.io: Connection pending (will retry automatically). This is normal if backend is starting or user is not authenticated.");
        }
        this.reconnectAttempts++;
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.log("Socket.io: Max reconnection attempts reached. App continues to work normally without real-time updates.");
        }
      });
    } catch (error: any) {
      console.warn("Failed to initialize Socket.io (non-critical):", error.message);
    }

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log("Socket.io disconnected");
    }
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (...args: any[]) => void) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }

  emit(event: string, data?: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Получить socket для прямого использования
  getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();

