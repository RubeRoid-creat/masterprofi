import { useEffect, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { updateOrder, setLastSyncTime } from '../store/slices/ordersSlice';
import { Order } from '../types/order';

interface UseWebSocketOptions {
  url: string;
  enabled?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export const useWebSocket = (options: UseWebSocketOptions) => {
  const { url, enabled = true, onConnect, onDisconnect, onError } = options;
  const dispatch = useDispatch();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    if (!enabled || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log('WebSocket connected');
        onConnect?.();
        dispatch(setLastSyncTime(new Date().toISOString()));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle different message types
          if (data.type === 'order_update') {
            const order: Order = data.order;
            dispatch(updateOrder(order));
          } else if (data.type === 'new_order') {
            const order: Order = { ...data.order, isNew: true };
            dispatch(updateOrder(order));
          } else if (data.type === 'order_removed') {
            // Handle order removal if needed
            // dispatch(removeOrder(data.orderId));
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        onError?.(new Error('WebSocket connection error'));
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        onDisconnect?.();
        wsRef.current = null;

        // Auto-reconnect after 5 seconds
        if (enabled) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 5000);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      onError?.(error as Error);
    }
  }, [url, enabled, onConnect, onDisconnect, onError, dispatch]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    connected: wsRef.current?.readyState === WebSocket.OPEN,
    sendMessage,
    disconnect,
    reconnect: connect,
  };
};









