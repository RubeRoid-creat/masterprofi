/**
 * Universal Data Sync Hook
 * Handles WebSocket events for real-time data synchronization
 */

import { useEffect } from "react";
import { useSocket } from "./useSocket";

interface DataSyncCallbacks {
  onUserCreated?: (user: any) => void;
  onUserUpdated?: (user: any) => void;
  onProfileUpdated?: (data: { userId: string; profile: any }) => void;
  onOrderCreated?: (order: any) => void;
  onOrderUpdated?: (order: any) => void;
  onOrderStatusChanged?: (data: { orderId: string; status: string; order?: any }) => void;
  onPaymentCreated?: (payment: any) => void;
  onPaymentUpdated?: (payment: any) => void;
  onReviewCreated?: (review: any) => void;
  onReviewUpdated?: (review: any) => void;
  onChatMessageCreated?: (data: { chatId: string; message: any }) => void;
  onChatUpdated?: (chat: any) => void;
  onMLMNetworkUpdated?: (data: { userId: string; networkData: any }) => void;
  onCommissionUpdated?: (data: { userId: string; commission: any }) => void;
  onDataSync?: (data: { entityType: string; action: 'created' | 'updated' | 'deleted'; data: any }) => void;
}

export const useDataSync = (callbacks: DataSyncCallbacks) => {
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    // User events
    if (callbacks.onUserCreated) {
      socket.on('user_created', callbacks.onUserCreated);
    }
    if (callbacks.onUserUpdated) {
      socket.on('user_updated', callbacks.onUserUpdated);
    }
    if (callbacks.onProfileUpdated) {
      socket.on('profile_updated', callbacks.onProfileUpdated);
    }

    // Order events
    if (callbacks.onOrderCreated) {
      socket.on('order_created', callbacks.onOrderCreated);
    }
    if (callbacks.onOrderUpdated) {
      socket.on('order:updated', callbacks.onOrderUpdated);
    }
    if (callbacks.onOrderStatusChanged) {
      socket.on('order_status_changed', callbacks.onOrderStatusChanged);
    }

    // Payment events
    if (callbacks.onPaymentCreated) {
      socket.on('payment_created', callbacks.onPaymentCreated);
    }
    if (callbacks.onPaymentUpdated) {
      socket.on('payment_updated', callbacks.onPaymentUpdated);
    }

    // Review events
    if (callbacks.onReviewCreated) {
      socket.on('review_created', callbacks.onReviewCreated);
    }
    if (callbacks.onReviewUpdated) {
      socket.on('review_updated', callbacks.onReviewUpdated);
    }

    // Chat events
    if (callbacks.onChatMessageCreated) {
      socket.on('chat_message_created', callbacks.onChatMessageCreated);
    }
    if (callbacks.onChatUpdated) {
      socket.on('chat_updated', callbacks.onChatUpdated);
    }

    // MLM events
    if (callbacks.onMLMNetworkUpdated) {
      socket.on('mlm_network_updated', callbacks.onMLMNetworkUpdated);
    }
    if (callbacks.onCommissionUpdated) {
      socket.on('commission_updated', callbacks.onCommissionUpdated);
    }

    // Generic data sync event
    if (callbacks.onDataSync) {
      socket.on('data_sync', callbacks.onDataSync);
    }

    return () => {
      // Cleanup listeners
      if (callbacks.onUserCreated) socket.off('user_created');
      if (callbacks.onUserUpdated) socket.off('user_updated');
      if (callbacks.onProfileUpdated) socket.off('profile_updated');
      if (callbacks.onOrderCreated) socket.off('order_created');
      if (callbacks.onOrderUpdated) socket.off('order:updated');
      if (callbacks.onOrderStatusChanged) socket.off('order_status_changed');
      if (callbacks.onPaymentCreated) socket.off('payment_created');
      if (callbacks.onPaymentUpdated) socket.off('payment_updated');
      if (callbacks.onReviewCreated) socket.off('review_created');
      if (callbacks.onReviewUpdated) socket.off('review_updated');
      if (callbacks.onChatMessageCreated) socket.off('chat_message_created');
      if (callbacks.onChatUpdated) socket.off('chat_updated');
      if (callbacks.onMLMNetworkUpdated) socket.off('mlm_network_updated');
      if (callbacks.onCommissionUpdated) socket.off('commission_updated');
      if (callbacks.onDataSync) socket.off('data_sync');
    };
  }, [socket, callbacks]);
};

