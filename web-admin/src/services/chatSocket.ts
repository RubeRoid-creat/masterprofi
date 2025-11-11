import { io, Socket } from "socket.io-client";

class ChatSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(token: string): void {
    if (this.socket?.connected) {
      return;
    }

    const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
    
    // Убираем /api из URL для Socket.io
    const socketUrl = backendUrl.replace(/\/api$/, "");

    try {
      this.socket = io(`${socketUrl}/chat`, {
        auth: { token },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: this.maxReconnectAttempts,
        timeout: 5000,
        forceNew: false,
      });

      this.socket.on("connect", () => {
        console.log("Chat socket connected");
        this.reconnectAttempts = 0;
      });

      this.socket.on("disconnect", (reason) => {
        console.log("Chat socket disconnected:", reason);
      });

      this.socket.on("connect_error", (error) => {
        // Не критичная ошибка для чата
        console.warn("Chat socket connection error (non-critical):", error.message);
        this.reconnectAttempts++;
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.warn("Max reconnection attempts reached for Chat socket. Chat features will be unavailable.");
        }
      });
    } catch (error: any) {
      console.warn("Failed to initialize Chat Socket (non-critical):", error.message);
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinChat(chatId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error("Socket not connected"));
        return;
      }

      this.socket.emit("join_chat", { chatId }, (response: any) => {
        if (response?.error) {
          reject(new Error(response.error));
        } else {
          resolve();
        }
      });
    });
  }

  leaveChat(chatId: string): void {
    if (this.socket?.connected) {
      this.socket.emit("leave_chat", { chatId });
    }
  }

  sendMessage(chatId: string, content: string, type = "text"): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error("Socket not connected"));
        return;
      }

      this.socket.emit(
        "send_message",
        { chatId, content, type },
        (response: any) => {
          if (response?.error) {
            reject(new Error(response.error));
          } else {
            resolve(response.message);
          }
        }
      );
    });
  }

  onNewMessage(callback: (data: { message: any; chatId: string }) => void): void {
    this.socket?.on("new_message", callback);
  }

  offNewMessage(callback?: (data: any) => void): void {
    if (callback) {
      this.socket?.off("new_message", callback);
    } else {
      this.socket?.off("new_message");
    }
  }

  onChatUpdated(callback: (data: { chatId: string; lastMessage: any }) => void): void {
    this.socket?.on("chat_updated", callback);
  }

  offChatUpdated(callback?: (data: any) => void): void {
    if (callback) {
      this.socket?.off("chat_updated", callback);
    } else {
      this.socket?.off("chat_updated");
    }
  }

  onUserTyping(callback: (data: { userId: string; chatId: string; isTyping: boolean }) => void): void {
    this.socket?.on("user_typing", callback);
  }

  offUserTyping(callback?: (data: any) => void): void {
    if (callback) {
      this.socket?.off("user_typing", callback);
    } else {
      this.socket?.off("user_typing");
    }
  }

  sendTyping(chatId: string, isTyping: boolean): void {
    if (this.socket?.connected) {
      this.socket.emit("typing", { chatId, isTyping });
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const chatSocketService = new ChatSocketService();

