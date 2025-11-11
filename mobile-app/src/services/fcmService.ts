/**
 * Firebase Cloud Messaging Service
 * Handles FCM integration and message handling
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationService } from './notificationService';
import { NotificationCategory, NotificationData } from '../types/notifications';
import { config } from '../config/environments';

// Note: For Expo, FCM is typically handled via Expo Push Notifications
// This service provides a wrapper for FCM-specific functionality
// For bare React Native, you would use @react-native-firebase/messaging

const FCM_TOKEN_KEY = 'fcm_token';

export interface FCMMessage {
  notification?: {
    title: string;
    body: string;
  };
  data?: {
    [key: string]: string;
  };
  messageId: string;
  from: string;
  sentTime: number;
}

class FCMService {
  private fcmToken: string | null = null;

  /**
   * Initialize FCM service
   */
  async initialize(): Promise<void> {
    try {
      // For Expo, use Expo Push Notifications
      // FCM token will be obtained via Expo's push notification service
      const expoToken = await notificationService.registerForPushNotifications();
      
      if (expoToken) {
        // In production, convert Expo token to FCM token via backend
        // For now, store Expo token as FCM token
        this.fcmToken = expoToken;
        await AsyncStorage.setItem(FCM_TOKEN_KEY, expoToken);
      }
    } catch (error) {
      console.error('Error initializing FCM service:', error);
    }
  }

  /**
   * Get FCM token
   */
  async getToken(): Promise<string | null> {
    if (this.fcmToken) {
      return this.fcmToken;
    }

    const stored = await AsyncStorage.getItem(FCM_TOKEN_KEY);
    if (stored) {
      this.fcmToken = stored;
      return stored;
    }

    return null;
  }

  /**
   * Handle FCM message
   */
  async handleMessage(message: FCMMessage): Promise<void> {
    try {
      // Extract notification data
      const category = (message.data?.category || 'system') as NotificationCategory;
      const notificationData: NotificationData = {
        category,
        orderId: message.data?.orderId,
        messageId: message.data?.messageId,
        paymentId: message.data?.paymentId,
        userId: message.data?.userId,
        deepLink: message.data?.deepLink,
        ...message.data,
      };

      // Map FCM message to notification payload
      const title = message.notification?.title || 'MasterProfi';
      const body = message.notification?.body || 'You have a new notification';

      // Handle notification based on category
      await this.handleNotificationByCategory(category, title, body, notificationData);
    } catch (error) {
      console.error('Error handling FCM message:', error);
    }
  }

  /**
   * Handle notification based on category
   */
  private async handleNotificationByCategory(
    category: NotificationCategory,
    title: string,
    body: string,
    data: NotificationData
  ): Promise<void> {
    switch (category) {
      case 'new_order':
        await this.handleNewOrderNotification(title, body, data);
        break;
      case 'message':
        await this.handleMessageNotification(title, body, data);
        break;
      case 'payment':
        await this.handlePaymentNotification(title, body, data);
        break;
      case 'mlm':
        await this.handleMLMNotification(title, body, data);
        break;
      default:
        // System notification
        console.log('System notification:', title, body);
        break;
    }
  }

  /**
   * Handle new order notification
   */
  private async handleNewOrderNotification(
    title: string,
    body: string,
    data: NotificationData
  ): Promise<void> {
    // Update orders in Redux store
    // Navigate to order details if needed
    console.log('New order notification:', data.orderId);
  }

  /**
   * Handle message notification
   */
  private async handleMessageNotification(
    title: string,
    body: string,
    data: NotificationData
  ): Promise<void> {
    // Update chat messages in Redux store
    // Navigate to chat if needed
    console.log('Message notification:', data.messageId);
  }

  /**
   * Handle payment notification
   */
  private async handlePaymentNotification(
    title: string,
    body: string,
    data: NotificationData
  ): Promise<void> {
    // Update earnings in Redux store
    // Show payment details
    console.log('Payment notification:', data.paymentId);
  }

  /**
   * Handle MLM notification
   */
  private async handleMLMNotification(
    title: string,
    body: string,
    data: NotificationData
  ): Promise<void> {
    // Update MLM network in Redux store
    console.log('MLM notification:', data);
  }

  /**
   * Subscribe to topic
   */
  async subscribeToTopic(topic: string): Promise<void> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No FCM token available');
      }

      // Send subscription request to backend
      const authToken = await AsyncStorage.getItem('auth_token');
      const API_BASE_URL = config.apiUrl;
      
      await fetch(`${API_BASE_URL}/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          token,
          topic,
        }),
      });
    } catch (error) {
      console.error('Error subscribing to topic:', error);
    }
  }

  /**
   * Unsubscribe from topic
   */
  async unsubscribeFromTopic(topic: string): Promise<void> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No FCM token available');
      }

      // Send unsubscription request to backend
      const authToken = await AsyncStorage.getItem('auth_token');
      const API_BASE_URL = config.apiUrl;
      
      await fetch(`${API_BASE_URL}/notifications/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          token,
          topic,
        }),
      });
    } catch (error) {
      console.error('Error unsubscribing from topic:', error);
    }
  }

  /**
   * Delete FCM token (on logout)
   */
  async deleteToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(FCM_TOKEN_KEY);
      this.fcmToken = null;
      
      // Notify backend
      const authToken = await AsyncStorage.getItem('auth_token');
      if (authToken) {
        const API_BASE_URL = config.apiUrl;
        await fetch(`${API_BASE_URL}/notifications/delete-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
        });
      }
    } catch (error) {
      console.error('Error deleting FCM token:', error);
    }
  }
}

export const fcmService = new FCMService();




