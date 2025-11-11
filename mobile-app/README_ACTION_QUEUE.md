# Action Queue System

Система очереди действий для офлайн-операций с автоматическим повторным выполнением, обнаружением конфликтов и индикаторами прогресса.

## Возможности

✅ **Order Status Updates** - Обновление статуса заказов
✅ **Chat Messages** - Отправка сообщений в чат
✅ **Photo Uploads** - Загрузка фотографий
✅ **Location Updates** - Обновление местоположения
✅ **Automatic Retry Logic** - Автоматическое повторное выполнение
✅ **Conflict Detection** - Обнаружение конфликтов
✅ **Progress Indicators** - Индикаторы прогресса

## Использование

### Basic Usage

```tsx
import { useActionQueue } from '../hooks/useActionQueue';

const { enqueue, stats, actions } = useActionQueue();

// Enqueue order status update
await enqueue('update_order_status', {
  orderId: 'order-123',
  status: 'in_progress',
  notes: 'Started work',
}, {
  orderId: 'order-123',
});
```

### Action Types

```typescript
type ActionType = 
  | 'update_order_status'
  | 'send_message'
  | 'upload_photo'
  | 'update_location'
  | 'accept_order'
  | 'decline_order'
  | 'update_profile'
  | 'create_order_note'
  | 'update_service_area';
```

### Order Status Update

```tsx
await enqueue('update_order_status', {
  orderId: 'order-123',
  status: 'completed',
  notes: 'Work completed successfully',
});
```

### Send Message

```tsx
await enqueue('send_message', {
  orderId: 'order-123',
  message: 'I will arrive in 30 minutes',
  senderId: 'master-123',
  senderName: 'John Doe',
  senderType: 'master',
  attachments: [],
});
```

### Upload Photo

```tsx
await enqueue('upload_photo', {
  orderId: 'order-123',
  photos: [
    {
      id: 'photo-1',
      uri: 'file://path/to/photo.jpg',
      type: 'photo',
      // ...
    },
  ],
});
```

### Update Location

```tsx
await enqueue('update_location', {
  orderId: 'order-123',
  location: {
    latitude: 55.7558,
    longitude: 37.6173,
    timestamp: Date.now(),
  },
});
```

### Accept Order

```tsx
await enqueue('accept_order', {
  orderId: 'order-123',
  notes: 'Accepted the order',
  scheduledAt: '2024-01-15T10:00:00Z',
});
```

## Components

### ActionQueueIndicator

Индикатор очереди действий с количеством ожидающих операций:

```tsx
import { ActionQueueIndicator } from '../components/actionQueue';

<ActionQueueIndicator
  onPress={() => setShowQueue(true)}
  showCount={true}
/>
```

### ActionQueueList

Полный список действий в очереди:

```tsx
import { ActionQueueList } from '../components/actionQueue';

<ActionQueueList
  visible={showQueue}
  onClose={() => setShowQueue(false)}
/>
```

### ActionProgressBar

Индикатор прогресса для конкретного действия:

```tsx
import { ActionProgressBar } from '../components/actionQueue';

<ActionProgressBar
  action={action}
  showPercentage={true}
/>
```

## Hook API

### useActionQueue

```tsx
const {
  stats,           // Statistics: { total, pending, processing, completed, failed, conflict }
  actions,         // All actions in queue
  isLoading,       // Loading state
  enqueue,         // Add action to queue
  dequeue,         // Remove action from queue
  getAction,       // Get action by ID
  resolveConflict, // Resolve conflict
  clearCompleted,  // Clear completed actions
  retryAction,     // Retry failed action
} = useActionQueue();
```

## Conflict Resolution

При обнаружении конфликта:

```tsx
// Resolve with local data
await resolveConflict(actionId, 'local_wins');

// Resolve with server data
await resolveConflict(actionId, 'server_wins');

// Merge data
await resolveConflict(actionId, 'merge', {
  ...serverData,
  ...localData,
  // Custom merge logic
});
```

## Automatic Retry

Сервис автоматически повторяет неудачные действия с экспоненциальным backoff:

- Retry 1: 1 second
- Retry 2: 2 seconds
- Retry 3: 4 seconds

Максимальное количество повторов настраивается (по умолчанию: 3).

## Progress Tracking

Прогресс отслеживается для каждого действия:

```tsx
// Action with progress
const action = getAction(actionId);
console.log(action.progress); // 0-100
```

## Queue Statistics

```tsx
const stats = getStats();
// {
//   total: 10,
//   pending: 3,
//   processing: 1,
//   completed: 5,
//   failed: 1,
//   conflict: 0,
// }
```

## Configuration

Настройка в `App.tsx`:

```typescript
actionQueueService.initialize({
  maxRetries: 3,
  retryDelay: 1000,
  retryBackoff: 'exponential', // or 'linear'
  conflictResolution: 'server_wins',
});
```

## Action Status

- `pending` - Ожидает обработки
- `processing` - В процессе
- `completed` - Завершено
- `failed` - Ошибка
- `conflict` - Конфликт данных

## Best Practices

1. **Queue Actions Immediately** - Добавляйте действия в очередь сразу
2. **Monitor Stats** - Отслеживайте статистику для UX
3. **Handle Conflicts** - Обрабатывайте конфликты явно
4. **Show Progress** - Показывайте прогресс для длительных операций
5. **Retry Failed Actions** - Позволяйте пользователям повторить неудачные действия
6. **Clear Completed** - Очищайте завершенные действия периодически

## Integration Examples

### Order Status Update

```tsx
const handleStatusUpdate = async (orderId: string, status: OrderStatus) => {
  // Update locally
  dispatch(updateOrderStatus({ orderId, status }));

  // Queue for sync
  await enqueue('update_order_status', {
    orderId,
    status,
  }, {
    orderId,
  });
};
```

### Send Message Offline

```tsx
const handleSendMessage = async (orderId: string, message: string) => {
  // Add to local chat
  dispatch(addChatMessage({ orderId, message }));

  // Queue for sync
  await enqueue('send_message', {
    orderId,
    message,
    senderId: user.id,
    senderName: user.name,
    senderType: 'master',
  }, {
    orderId,
    messageId: `temp-${Date.now()}`,
  });
};
```

### Upload Photos

```tsx
const handleUploadPhotos = async (orderId: string, photos: MediaItem[]) => {
  // Queue photos for upload
  await enqueue('upload_photo', {
    orderId,
    photos,
  }, {
    orderId,
  });
};
```

## Troubleshooting

### Actions Not Processing

1. Проверьте статус сети
2. Убедитесь что сервис инициализирован
3. Проверьте логи ошибок

### Conflicts Not Resolving

Убедитесь что:
- Конфликт обнаружен (status === 'conflict')
- Вызван метод resolveConflict
- Данные корректны

### Progress Not Updating

Прогресс обновляется автоматически при обработке. Убедитесь что:
- Действие в статусе 'processing'
- Сервис правильно обновляет прогресс
- Компонент подписан на изменения








