import { useEffect, useRef, useCallback, useState } from 'react';
import { Message, TypingIndicator } from '../types/chat';
import { config } from '../config/environments';

interface UseChatWebSocketOptions {
  chatId: string;
  userId: string;
  enabled?: boolean;
  onMessage?: (message: Message) => void;
  onTyping?: (indicator: TypingIndicator) => void;
  onMessageStatus?: (messageId: string, status: Message['status']) => void;
  onOnlineStatus?: (userId: string, isOnline: boolean) => void;
}

export const useChatWebSocket = (options: UseChatWebSocketOptions) => {
  const {
    chatId,
    userId,
    enabled = true,
    onMessage,
    onTyping,
    onMessageStatus,
    onOnlineStatus,
  } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    if (!enabled || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const wsUrl = `${config.wsUrl}/api/chat/${chatId}/ws?userId=${userId}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('Chat WebSocket connected');
        setConnected(true);
        // Join chat room
        ws.send(
          JSON.stringify({
            type: 'join',
            chatId,
            userId,
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case 'message':
              onMessage?.(data.message as Message);
              break;
            case 'typing':
              onTyping?.(data.indicator as TypingIndicator);
              break;
            case 'message_status':
              onMessageStatus?.(data.messageId, data.status);
              break;
            case 'online_status':
              onOnlineStatus?.(data.userId, data.isOnline);
              break;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('Chat WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('Chat WebSocket disconnected');
        setConnected(false);
        wsRef.current = null;

        // Auto-reconnect after 3 seconds
        if (enabled) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 3000);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
    }
  }, [chatId, userId, enabled, onMessage, onTyping, onMessageStatus, onOnlineStatus]);

  const sendMessage = useCallback(
    (message: Partial<Message>) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'message',
            chatId,
            message,
          })
        );
      }
    },
    [chatId]
  );

  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'typing',
            chatId,
            userId,
            isTyping,
          })
        );
      }
    },
    [chatId, userId]
  );

  const markAsRead = useCallback(
    (messageIds: string[]) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'read',
            chatId,
            userId,
            messageIds,
          })
        );
      }
    },
    [chatId, userId]
  );

  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [enabled, connect]);

  return {
    connected,
    sendMessage,
    sendTyping,
    markAsRead,
    reconnect: connect,
  };
};




