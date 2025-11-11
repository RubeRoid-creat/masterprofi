/**
 * Hook for notification management
 */

import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/notificationService';
import { fcmService } from '../services/fcmService';
import {
  NotificationPreferences,
  LocalNotificationSchedule,
  NotificationCategory,
} from '../types/notifications';

export interface UseNotificationsReturn {
  pushToken: string | null;
  badgeCount: number;
  preferences: NotificationPreferences;
  isLoading: boolean;
  error: string | null;
  refreshToken: () => Promise<void>;
  scheduleLocalNotification: (schedule: LocalNotificationSchedule) => Promise<string>;
  cancelScheduledNotification: (identifier: string) => Promise<void>;
  updatePreferences: (updates: Partial<NotificationPreferences>) => Promise<void>;
  setBadgeCount: (count: number) => Promise<void>;
  clearBadge: () => Promise<void>;
  subscribeToTopic: (topic: string) => Promise<void>;
  unsubscribeFromTopic: (topic: string) => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [badgeCount, setBadgeCountState] = useState<number>(0);
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    notificationService.getPreferences()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshToken = useCallback(async () => {
    try {
      const token = await notificationService.registerForPushNotifications();
      setPushToken(token);
    } catch (err: any) {
      setError(err.message || 'Failed to refresh token');
    }
  }, []);

  const scheduleLocalNotification = useCallback(
    async (schedule: LocalNotificationSchedule): Promise<string> => {
      try {
        return await notificationService.scheduleLocalNotification(schedule);
      } catch (err: any) {
        setError(err.message || 'Failed to schedule notification');
        throw err;
      }
    },
    []
  );

  const cancelScheduledNotification = useCallback(async (identifier: string) => {
    try {
      await notificationService.cancelScheduledNotification(identifier);
    } catch (err: any) {
      setError(err.message || 'Failed to cancel notification');
    }
  }, []);

  const updatePreferences = useCallback(
    async (updates: Partial<NotificationPreferences>) => {
      try {
        await notificationService.updatePreferences(updates);
        setPreferences(notificationService.getPreferences());
      } catch (err: any) {
        setError(err.message || 'Failed to update preferences');
      }
    },
    []
  );

  const setBadgeCount = useCallback(async (count: number) => {
    try {
      await notificationService.setBadgeCount(count);
      setBadgeCountState(count);
    } catch (err: any) {
      setError(err.message || 'Failed to set badge count');
    }
  }, []);

  const clearBadge = useCallback(async () => {
    try {
      await notificationService.clearBadge();
      setBadgeCountState(0);
    } catch (err: any) {
      setError(err.message || 'Failed to clear badge');
    }
  }, []);

  const subscribeToTopic = useCallback(async (topic: string) => {
    try {
      await fcmService.subscribeToTopic(topic);
    } catch (err: any) {
      setError(err.message || 'Failed to subscribe to topic');
    }
  }, []);

  const unsubscribeFromTopic = useCallback(async (topic: string) => {
    try {
      await fcmService.unsubscribeFromTopic(topic);
    } catch (err: any) {
      setError(err.message || 'Failed to unsubscribe from topic');
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Initialize notification service
        await notificationService.initialize();
        await fcmService.initialize();

        // Get push token
        const token = notificationService.getPushToken();
        setPushToken(token);

        // Get badge count
        const badge = await notificationService.getBadgeCount();
        setBadgeCountState(badge);

        // Load preferences
        const prefs = notificationService.getPreferences();
        setPreferences(prefs);
      } catch (err: any) {
        setError(err.message || 'Failed to initialize notifications');
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  // Update badge count periodically
  useEffect(() => {
    const interval = setInterval(async () => {
      const badge = await notificationService.getBadgeCount();
      setBadgeCountState(badge);
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    pushToken,
    badgeCount,
    preferences,
    isLoading,
    error,
    refreshToken,
    scheduleLocalNotification,
    cancelScheduledNotification,
    updatePreferences,
    setBadgeCount,
    clearBadge,
    subscribeToTopic,
    unsubscribeFromTopic,
  };
}








