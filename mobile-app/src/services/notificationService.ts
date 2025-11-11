/**
 * Notification Service
 * Handles push notifications, local notifications, and notification preferences
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '../config/environments';
import {
  NotificationCategory,
  NotificationData,
  NotificationPayload,
  NotificationPreferences,
  LocalNotificationSchedule,
} from '../types/notifications';

const PREFERENCES_STORAGE_KEY = 'notification_preferences';
const EXPO_PUSH_TOKEN_KEY = 'expo_push_token';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  private expoPushToken: string | null = null;
  private notificationListener: Notifications.EventSubscription | null = null;
  private responseListener: Notifications.EventSubscription | null = null;
  private preferences: NotificationPreferences | null = null;

  /**
   * Initialize notification service
   */
  async initialize(): Promise<void> {
    try {
      // Check if device
      if (!Device.isDevice) {
        console.warn('Notifications only work on physical devices');
        return;
      }

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Push notifications require permission. Please enable them in settings.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Get or register push token (only on native platforms)
      if (Platform.OS !== 'web') {
        await this.registerForPushNotifications();
      }

      // Load preferences
      await this.loadPreferences();

      // Set up notification listeners
      this.setupNotificationListeners();
    } catch (error) {
      console.error('Error initializing notification service:', error);
    }
  }

  /**
   * Register for push notifications and get Expo push token
   */
  async registerForPushNotifications(): Promise<string | null> {
    // Push notifications not fully supported on web without VAPID key
    if (Platform.OS === 'web') {
      console.warn('Push notifications are not available on web platform without VAPID configuration.');
      return null;
    }

    try {
      // Check for existing token
      const existingToken = await AsyncStorage.getItem(EXPO_PUSH_TOKEN_KEY);
      if (existingToken) {
        this.expoPushToken = existingToken;
        return existingToken;
      }

      // Get new token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-project-id', // TODO: Replace with your Expo project ID
      });

      const token = tokenData.data;
      this.expoPushToken = token;

      // Save token
      await AsyncStorage.setItem(EXPO_PUSH_TOKEN_KEY, token);

      // Send token to your backend
      await this.sendTokenToBackend(token);

      return token;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  }

  /**
   * Send push token to backend
   */
  private async sendTokenToBackend(token: string): Promise<void> {
    try {
      // Get auth token
      const authToken = await AsyncStorage.getItem('auth_token');
      if (!authToken) {
        return;
      }

      // Send to backend
      const API_BASE_URL = config.apiUrl;
      await fetch(`${API_BASE_URL}/notifications/register-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          token,
          platform: Platform.OS,
          deviceId: Device.modelName || 'unknown',
        }),
      });
    } catch (error) {
      console.error('Error sending token to backend:', error);
    }
  }

  /**
   * Get current push token
   */
  getPushToken(): string | null {
    return this.expoPushToken;
  }

  /**
   * Schedule local notification
   */
  async scheduleLocalNotification(
    schedule: LocalNotificationSchedule
  ): Promise<string> {
    try {
      const trigger: Notifications.NotificationTriggerInput =
        schedule.trigger.seconds
          ? { seconds: schedule.trigger.seconds, repeats: schedule.trigger.repeats }
          : schedule.trigger.date
          ? { date: schedule.trigger.date, repeats: schedule.trigger.repeats }
          : { seconds: 1 };

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: schedule.title,
          body: schedule.body,
          data: schedule.data || {},
          sound: true,
          badge: await this.getBadgeCount(),
        },
        trigger,
        identifier: schedule.identifier,
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling local notification:', error);
      throw error;
    }
  }

  /**
   * Cancel scheduled notification
   */
  async cancelScheduledNotification(identifier: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllScheduledNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Get all scheduled notifications
   */
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  /**
   * Handle received notification (called by listener)
   */
  async handleReceivedNotification(
    notification: Notifications.Notification,
    callback?: (data: NotificationData) => void
  ): Promise<void> {
    const data = notification.request.content.data as NotificationData;
    const category = data?.category;

    // Check preferences
    if (!this.shouldShowNotification(category)) {
      return;
    }

    // Update badge
    if (category === 'new_order' || category === 'message') {
      await this.incrementBadge();
    }

    // Call callback if provided
    if (callback) {
      callback(data);
    }
  }

  /**
   * Handle notification response (user taps notification)
   */
  async handleNotificationResponse(
    response: Notifications.NotificationResponse,
    callback?: (data: NotificationData) => void
  ): Promise<void> {
    const data = response.notification.request.content.data as NotificationData;

    // Mark notification as read
    await this.markAsRead(data);

    // Handle deep link if provided
    if (data?.deepLink) {
      // Navigate to deep link (implement navigation logic)
      console.log('Navigate to deep link:', data.deepLink);
    }

    // Call callback if provided
    if (callback) {
      callback(data);
    }
  }

  /**
   * Setup notification listeners
   */
  setupNotificationListeners(): void {
    // Remove existing listeners
    if (this.notificationListener) {
      this.notificationListener.remove();
    }
    if (this.responseListener) {
      this.responseListener.remove();
    }

    // Listener for notifications received while app is in foreground
    this.notificationListener = Notifications.addNotificationReceivedListener(
      async (notification) => {
        await this.handleReceivedNotification(notification);
      }
    );

    // Listener for when user taps notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      async (response) => {
        await this.handleNotificationResponse(response);
      }
    );
  }

  /**
   * Remove notification listeners
   */
  removeListeners(): void {
    if (this.notificationListener) {
      this.notificationListener.remove();
      this.notificationListener = null;
    }
    if (this.responseListener) {
      this.responseListener.remove();
      this.responseListener = null;
    }
  }

  /**
   * Check if notification should be shown based on preferences
   */
  private shouldShowNotification(category?: NotificationCategory): boolean {
    if (!this.preferences || !this.preferences.enabled) {
      return false;
    }

    if (!category) {
      return true;
    }

    const categoryPrefs = this.preferences.categories[category];
    if (!categoryPrefs || !categoryPrefs.enabled) {
      return false;
    }

    // Check quiet hours
    if (this.preferences.quietHours?.enabled) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;

      const { startTime, endTime } = this.preferences.quietHours;
      if (this.isInQuietHours(currentTime, startTime, endTime)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if current time is in quiet hours
   */
  private isInQuietHours(currentTime: string, startTime: string, endTime: string): boolean {
    const current = this.timeToMinutes(currentTime);
    const start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);

    if (start <= end) {
      return current >= start && current <= end;
    } else {
      // Overnight quiet hours
      return current >= start || current <= end;
    }
  }

  /**
   * Convert time string (HH:mm) to minutes
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Load notification preferences
   */
  async loadPreferences(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(PREFERENCES_STORAGE_KEY);
      if (stored) {
        this.preferences = JSON.parse(stored);
      } else {
        // Default preferences
        this.preferences = this.getDefaultPreferences();
        await this.savePreferences();
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      this.preferences = this.getDefaultPreferences();
    }
  }

  /**
   * Save notification preferences
   */
  async savePreferences(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        PREFERENCES_STORAGE_KEY,
        JSON.stringify(this.preferences)
      );
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }

  /**
   * Get notification preferences
   */
  getPreferences(): NotificationPreferences {
    return this.preferences || this.getDefaultPreferences();
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(updates: Partial<NotificationPreferences>): Promise<void> {
    if (!this.preferences) {
      this.preferences = this.getDefaultPreferences();
    }

    this.preferences = {
      ...this.preferences,
      ...updates,
      categories: {
        ...this.preferences.categories,
        ...(updates.categories || {}),
      },
    };

    await this.savePreferences();
  }

  /**
   * Get default preferences
   */
  private getDefaultPreferences(): NotificationPreferences {
    return {
      enabled: true,
      categories: {
        new_order: {
          enabled: true,
          sound: true,
          vibrate: true,
          priority: 'high',
        },
        message: {
          enabled: true,
          sound: true,
          vibrate: true,
          priority: 'high',
        },
        payment: {
          enabled: true,
          sound: false,
          vibrate: true,
          priority: 'normal',
        },
        reminder: {
          enabled: true,
          sound: false,
          vibrate: false,
          priority: 'low',
        },
        system: {
          enabled: true,
          sound: false,
          vibrate: false,
          priority: 'normal',
        },
        mlm: {
          enabled: true,
          sound: false,
          vibrate: false,
          priority: 'normal',
        },
      },
      badgeEnabled: true,
    };
  }

  /**
   * Get badge count
   */
  async getBadgeCount(): Promise<number> {
    try {
      const count = await Notifications.getBadgeCountAsync();
      return count;
    } catch (error) {
      console.error('Error getting badge count:', error);
      return 0;
    }
  }

  /**
   * Set badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  }

  /**
   * Increment badge count
   */
  async incrementBadge(): Promise<void> {
    if (!this.preferences?.badgeEnabled) {
      return;
    }

    const current = await this.getBadgeCount();
    await this.setBadgeCount(current + 1);
  }

  /**
   * Decrement badge count
   */
  async decrementBadge(): Promise<void> {
    const current = await this.getBadgeCount();
    if (current > 0) {
      await this.setBadgeCount(current - 1);
    }
  }

  /**
   * Clear badge
   */
  async clearBadge(): Promise<void> {
    await this.setBadgeCount(0);
  }

  /**
   * Mark notification as read
   */
  private async markAsRead(data: NotificationData): Promise<void> {
    // Implement marking notification as read in backend
    // For now, just decrement badge for relevant categories
    if (data?.category === 'new_order' || data?.category === 'message') {
      await this.decrementBadge();
    }
  }
}

export const notificationService = new NotificationService();

