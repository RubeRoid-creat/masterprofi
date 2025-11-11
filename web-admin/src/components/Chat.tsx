import { useEffect, useState, useRef, useCallback } from "react";
import { chatAPI } from "../services/api";
import { chatSocketService } from "../services/chatSocket";
import { useAppSelector } from "../store/hooks";


interface Message {
  id: string;
  content?: string;
  type: "text" | "image" | "file" | "system";
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  senderId: string;
  sender?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  createdAt: string;
  isRead: boolean;
}

interface ChatProps {
  orderId: string;
  onClose?: () => void;
}

export default function Chat({ orderId, onClose }: ChatProps) {
  const user = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);

  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [otherUser, setOtherUser] = useState<any>(null);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Загружаем или создаем чат
  useEffect(() => {
    const loadChat = async () => {
      try {
        const chat = await chatAPI.getOrCreateChat(orderId);
        setChatId(chat.id);
        setOtherUser(
          chat.clientId === user?.id ? chat.master : chat.client
        );

        // Загружаем сообщения
        const { messages: loadedMessages } = await chatAPI.getMessages(chat.id);
        setMessages(loadedMessages);
        setLoading(false);

        // Подключаемся к Socket.io
        if (token) {
          chatSocketService.connect(token);
          await chatSocketService.joinChat(chat.id);

          // Отмечаем как прочитанные
          await chatAPI.markAsRead(chat.id);
        }

        scrollToBottom();
      } catch (err: any) {
        setError(err.message || "Ошибка загрузки чата");
        setLoading(false);
      }
    };

    loadChat();

    return () => {
      if (chatId) {
        chatSocketService.leaveChat(chatId);
      }
    };
  }, [orderId, user?.id, token]);

  // Подписка на новые сообщения
  useEffect(() => {
    if (!chatId) return;

    const handleNewMessage = async (data: { message: Message; chatId: string }) => {
      if (data.chatId === chatId) {
        setMessages((prev) => [...prev, data.message]);
        scrollToBottom();

        // Отмечаем как прочитанное
        if (data.message.senderId !== user?.id) {
          await chatAPI.markAsRead(chatId);
        }
      }
    };

    chatSocketService.onNewMessage(handleNewMessage);

    return () => {
      chatSocketService.offNewMessage(handleNewMessage);
    };
  }, [chatId, user?.id, scrollToBottom]);

  // Подписка на typing events
  useEffect(() => {
    if (!chatId) return;

    const handleTyping = (data: {
      userId: string;
      chatId: string;
      isTyping: boolean;
    }) => {
      if (data.chatId === chatId && data.userId !== user?.id) {
        setTypingUsers((prev) => {
          const next = new Set(prev);
          if (data.isTyping) {
            next.add(data.userId);
          } else {
            next.delete(data.userId);
          }
          return next;
        });
      }
    };

    chatSocketService.onUserTyping(handleTyping);

    return () => {
      chatSocketService.offUserTyping(handleTyping);
    };
  }, [chatId, user?.id]);

  // Автопрокрутка при изменении сообщений
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = async () => {
    if (!chatId || !newMessage.trim() || sending) return;

    setSending(true);
    try {
      await chatSocketService.sendMessage(chatId, newMessage.trim(), "text");
      setNewMessage("");
      setError("");
    } catch (err: any) {
      setError(err.message || "Ошибка отправки сообщения");
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !chatId) return;

    setUploading(true);
    try {
      const message = await chatAPI.uploadFile(chatId, file);
      setMessages((prev) => [...prev, message]);
      scrollToBottom();
      setError("");
    } catch (err: any) {
      setError(err.message || "Ошибка загрузки файла");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleTyping = () => {
    if (!chatId || !chatSocketService.isConnected()) return;

    chatSocketService.sendTyping(chatId, true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      chatSocketService.sendTyping(chatId, false);
    }, 3000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-white dark:bg-gray-800 rounded-lg">
        <p className="text-gray-600 dark:text-gray-400">Загрузка чата...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
            {otherUser?.firstName?.[0] || otherUser?.email?.[0] || "?"}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {otherUser?.firstName && otherUser?.lastName
                ? `${otherUser.firstName} ${otherUser.lastName}`
                : otherUser?.email || "Пользователь"}
            </h3>
            {typingUsers.size > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                Печатает...
              </p>
            )}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ✕
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwn = message.senderId === user?.id;
          const isSystem = message.type === "system";

          return (
            <div
              key={message.id}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  isSystem
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 mx-auto"
                    : isOwn
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                }`}
              >
                {!isSystem && !isOwn && (
                  <p className="text-xs opacity-75 mb-1">
                    {message.sender?.firstName ||
                      message.sender?.email ||
                      "Пользователь"}
                  </p>
                )}

                {message.type === "text" && (
                  <p className="break-words">{message.content}</p>
                )}

                {message.type === "image" && message.fileUrl && (
                  <div>
                    <img
                      src={`${import.meta.env.VITE_API_URL || "http://localhost:3000"}${message.fileUrl}`}
                      alt={message.fileName || "Изображение"}
                      className="max-w-full rounded"
                    />
                    {message.fileName && (
                      <p className="text-xs mt-1 opacity-75">{message.fileName}</p>
                    )}
                  </div>
                )}

                {message.type === "file" && message.fileUrl && (
                  <div className="flex items-center gap-2">
                    <a
                      href={`${import.meta.env.VITE_API_URL || "http://localhost:3000"}${message.fileUrl}`}
                      download={message.fileName}
                      className="underline hover:opacity-80"
                    >
                      📎 {message.fileName || "Файл"}
                    </a>
                    {message.fileSize && (
                      <span className="text-xs opacity-75">
                        ({getFileSize(message.fileSize)})
                      </span>
                    )}
                  </div>
                )}

                <p className="text-xs opacity-75 mt-1">
                  {formatDate(message.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {error && (
        <div className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md disabled:opacity-50"
            title="Прикрепить файл"
          >
            📎
          </button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            accept="image/*,.pdf,.doc,.docx"
            className="hidden"
          />
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Введите сообщение..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={sending}
          />
          <button
            onClick={handleSendMessage}
            disabled={sending || !newMessage.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? "..." : "Отправить"}
          </button>
        </div>
      </div>
    </div>
  );
}

