# Push Notifications Integration

Полная интеграция системы push-уведомлений с Firebase Cloud Messaging, категориями, фоновой обработкой и настройками.

## Возможности

✅ **Firebase Cloud Messaging Setup**
- Интеграция с Expo Push Notifications
- Регистрация push токенов
- Отправка токенов на backend
- Подписка на топики

✅ **Notification Categories**
- New Orders - новые заказы
- Messages - сообщения
- Payments - платежи
- Reminders - напоминания
- System - системные
- MLM - MLM обновления

✅ **Background Notification Handling**
- Обработка уведомлений в фоне
- Deep linking
- Навигация при тапе
- Обновление состояния приложения

✅ **Notification Preferences**
- Включение/выключение по категориям
- Настройка звука и вибрации
- Приоритеты уведомлений
- Quiet Hours (тихие часы)
- Управление бейджами

✅ **Local Notifications for Reminders**
- Планирование локальных уведомлений
- Повторяющиеся напоминания
- Ежедневные/еженедельные напоминания
- Отмена запланированных уведомлений

✅ **Badge Count Management**
- Автоматическое обновление бейджа
- Инкремент/декремент
- Очистка бейджа
- Отключение бейджа

## Использование

### Basic Setup

```tsx
import { useNotifications } from '../hooks/useNotifications';

const {
  pushToken,
  badgeCount,
  preferences,
  scheduleLocalNotification,
  updatePreferences,
  clearBadge,
} = useNotifications();
```

### Schedule Local Notification

```tsx
await scheduleLocalNotification({
  identifier: 'reminder-1',
  title: 'Order Reminder',
  body: 'Don\'t forget to check your orders',
  data: {
    category: 'reminder',
    orderId: 'order-123',
  },
  trigger: {
    seconds: 3600, // 1 hour
    repeats: false,
  },
});

// Daily reminder
await scheduleLocalNotification({
  identifier: 'daily-reminder',
  title: 'Daily Check-in',
  body: 'Check your new orders',
  trigger: {
    repeatsDaily: true,
  },
});
```

### Update Preferences

```tsx
await updatePreferences({
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
      sound: false,
      vibrate: true,
      priority: 'normal',
    },
  },
  quietHours: {
    enabled: true,
    startTime: '22:00',
    endTime: '08:00',
  },
  badgeEnabled: true,
});
```

### Badge Management

```tsx
// Set badge count
await setBadgeCount(5);

// Increment badge
await notificationService.incrementBadge();

// Decrement badge
await notificationService.decrementBadge();

// Clear badge
await clearBadge();
```

### Topic Subscription

```tsx
// Subscribe to topic
await subscribeToTopic('new_orders');

// Unsubscribe from topic
await unsubscribeFromTopic('new_orders');
```

### Notification Components

```tsx
import {
  NotificationPreferencesScreen,
  NotificationHistory,
} from '../components/notifications';

// Preferences screen
<NotificationPreferencesScreen
  onClose={() => navigation.goBack()}
/>

// History component
<NotificationHistory
  category="new_order"
  limit={50}
/>
```

## Services

### NotificationService

```tsx
import { notificationService } from '../services/notificationService';

// Initialize
await notificationService.initialize();

// Get push token
const token = await notificationService.registerForPushNotifications();

// Schedule notification
await notificationService.scheduleLocalNotification(schedule);

// Badge management
await notificationService.setBadgeCount(5);
await notificationService.clearBadge();

// Preferences
const prefs = notificationService.getPreferences();
await notificationService.updatePreferences(updates);
```

### FCMService

```tsx
import { fcmService } from '../services/fcmService';

// Initialize
await fcmService.initialize();

// Get token
const token = await fcmService.getToken();

// Handle message
await fcmService.handleMessage(message);

// Topic subscription
await fcmService.subscribeToTopic('new_orders');
```

## Backend Integration

### Register Token Endpoint

```typescript
// POST /api/notifications/register-token
{
  token: string;
  platform: 'ios' | 'android';
  deviceId: string;
}
```

### Send Notification

Используйте Expo Push Notification API для отправки уведомлений:

```typescript
const response = await fetch('https://exp.host/--/api/v2/push/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    to: expoPushToken,
    sound: 'default',
    title: 'New Order',
    body: 'You have a new order',
    data: {
      category: 'new_order',
      orderId: 'order-123',
      deepLink: 'orders/order-123',
    },
    badge: 1,
  }),
});
```

## Настройка

### Expo Project ID

Обновите `projectId` в `notificationService.ts`:

```typescript
const tokenData = await Notifications.getExpoPushTokenAsync({
  projectId: 'your-expo-project-id',
});
```

### app.json Configuration

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#3B82F6",
          "sounds": ["./assets/notification-sound.wav"]
        }
      ]
    ],
    "ios": {
      "infoPlist": {
        "UIBackgroundModes": ["remote-notification"]
      }
    },
    "android": {
      "notification": {
        "icon": "./assets/notification-icon.png",
        "color": "#3B82F6",
        "sound": "./assets/notification-sound.wav"
      }
    }
  }
}
```

### Permissions (iOS)

В `Info.plist`:
- `NSUserNotificationsUsageDescription` - для локальных уведомлений

### Permissions (Android)

В `AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>
<uses-permission android:name="android.permission.VIBRATE"/>
```

## Notification Categories

### New Order

```typescript
{
  category: 'new_order',
  orderId: 'order-123',
  deepLink: 'orders/order-123',
}
```

### Message

```typescript
{
  category: 'message',
  messageId: 'msg-123',
  orderId: 'order-123',
  deepLink: 'chat/order-123',
}
```

### Payment

```typescript
{
  category: 'payment',
  paymentId: 'pay-123',
  deepLink: 'earnings/payment-123',
}
```

## Best Practices

1. **Request Permissions Early** - Запрашивайте разрешения при первом запуске
2. **Handle Token Refresh** - Обновляйте токен при изменении
3. **Respect Preferences** - Учитывайте настройки пользователя
4. **Update Badge Correctly** - Обновляйте бейдж при чтении уведомлений
5. **Deep Linking** - Используйте deep links для навигации
6. **Error Handling** - Обрабатывайте ошибки отправки токена
7. **Background Updates** - Обновляйте состояние при фоновых уведомлениях

## Troubleshooting

### Token Not Received

```tsx
// Check device
import * as Device from 'expo-device';
if (!Device.isDevice) {
  console.warn('Notifications only work on physical devices');
}
```

### Notifications Not Showing

1. Проверьте разрешения
2. Убедитесь что preferences.enabled === true
3. Проверьте quiet hours
4. Проверьте категорийные настройки

### Badge Not Updating

```tsx
// Ensure badge is enabled
await updatePreferences({ badgeEnabled: true });
```

### Background Notifications Not Working

Убедитесь что в `app.json` настроены background modes:

```json
{
  "ios": {
    "infoPlist": {
      "UIBackgroundModes": ["remote-notification"]
    }
  }
}
```








