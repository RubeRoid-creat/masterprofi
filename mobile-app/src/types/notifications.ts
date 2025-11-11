// Notification Types

export type NotificationCategory = 'new_order' | 'message' | 'payment' | 'reminder' | 'system' | 'mlm';

export interface NotificationData {
  category: NotificationCategory;
  orderId?: string;
  messageId?: string;
  paymentId?: string;
  userId?: string;
  deepLink?: string;
  [key: string]: any;
}

export interface NotificationPayload {
  title: string;
  body: string;
  data?: NotificationData;
  sound?: boolean;
  badge?: number;
  priority?: 'high' | 'normal' | 'low';
  vibrate?: boolean;
  icon?: string;
}

export interface NotificationPreferences {
  enabled: boolean;
  categories: {
    [key in NotificationCategory]: {
      enabled: boolean;
      sound: boolean;
      vibrate: boolean;
      priority: 'high' | 'normal' | 'low';
    };
  };
  quietHours?: {
    enabled: boolean;
    startTime: string; // HH:mm format
    endTime: string; // HH:mm format
  };
  badgeEnabled: boolean;
}

export interface LocalNotificationSchedule {
  identifier: string;
  title: string;
  body: string;
  data?: NotificationData;
  trigger: {
    seconds?: number;
    date?: Date;
    repeats?: boolean;
    repeatsDaily?: boolean;
    repeatsWeekly?: boolean;
  };
}

export interface NotificationHistoryItem {
  id: string;
  title: string;
  body: string;
  category: NotificationCategory;
  read: boolean;
  timestamp: string;
  data?: NotificationData;
}








