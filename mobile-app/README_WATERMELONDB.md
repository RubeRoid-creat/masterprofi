# WatermelonDB Setup Guide

Полная инструкция по настройке и использованию WatermelonDB для офлайн-поддержки.

## Установка

```bash
npm install @nozbe/watermelondb @nozbe/with-observables uuid @types/uuid expo-sqlite
```

## Настройка для Expo

WatermelonDB требует нативного SQLite адаптера. Для Expo используется `expo-sqlite`, но может потребоваться дополнительная настройка.

### Android

В `app.json`:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-sqlite",
        {
          "enableEncryption": true
        }
      ]
    ]
  }
}
```

### iOS

Дополнительная настройка не требуется для базовой функциональности.

## Схема базы данных

### Таблицы

1. **sync_status** - Статус синхронизации
2. **clients** - Клиенты
3. **orders** - Заказы
4. **messages** - Сообщения
5. **parts** - Каталог запчастей
6. **knowledge_base_articles** - Статьи базы знаний
7. **order_photos** - Фотографии заказов
8. **order_parts** - Связь заказов и запчастей

### Связи

- `Order` belongs_to `Client`
- `Order` has_many `Message`
- `Order` has_many `OrderPhoto`
- `Order` has_many `OrderPart`

## Использование

### Создание записи

```typescript
import { database } from './database/database';
import { Order } from './database/models/Order';

await database.write(async () => {
  await database.collections.get('orders').create((order) => {
    order.orderNumber = 'ORD-001';
    order.status = 'new';
    order.applianceType = 'washing_machine';
    order.address = 'Moscow, Red Square';
    order.isNew = true;
    order.isSynced = false;
    order.createdAt = Date.now();
    order.updatedAt = Date.now();
  });
});
```

### Запрос данных

```typescript
import { Q } from '@nozbe/watermelondb';

// Простой запрос
const newOrders = await database.collections
  .get('orders')
  .query(Q.where('status', 'new'))
  .fetch();

// Связь с клиентом
const orders = await database.collections
  .get('orders')
  .query(
    Q.where('status', 'new'),
    Q.sortBy('created_at', Q.desc)
  )
  .fetch();

// Связанные данные
const order = await database.collections.get('orders').find(orderId);
const client = await order.client.fetch();
const messages = await order.messages.fetch();
```

### Обновление записи

```typescript
await database.write(async () => {
  await order.update((o) => {
    o.status = 'in_progress';
    o.isSynced = false;
    o.updatedAt = Date.now();
  });
});
```

### Удаление записи

```typescript
await database.write(async () => {
  await order.destroyPermanently();
});
```

## Синхронизация

### Автоматическая синхронизация

Сервис синхронизации автоматически запускается при инициализации:

```typescript
import { databaseSyncService } from './services/databaseSyncService';

// Инициализация (вызывается в App.tsx)
await databaseSyncService.initialize();
```

### Ручная синхронизация

```typescript
// Синхронизировать все таблицы
await databaseSyncService.syncAll();

// Синхронизировать конкретную таблицу
await databaseSyncService.syncTable('orders');
```

### Отслеживание статуса синхронизации

```typescript
databaseSyncService.addListener((isSyncing) => {
  console.log('Syncing:', isSyncing);
});
```

## Конфликт-резолюция

При конфликте данных используются стратегии:

- `server_wins` - Серверные данные имеют приоритет
- `local_wins` - Локальные данные имеют приоритет
- `merge` - Объединение данных (требует кастомной логики)
- `manual` - Ручное разрешение конфликта

```typescript
await databaseSyncService.resolveConflict(
  'orders',
  orderId,
  serverData,
  'server_wins'
);
```

## Миграции

Добавление новой миграции:

```typescript
// migrations/index.ts
{
  toVersion: 2,
  steps: [
    addColumns({
      table: 'orders',
      columns: [
        { name: 'new_field', type: 'string', isOptional: true },
      ],
    }),
  ],
}
```

**Важно:** После добавления миграции обновите версию схемы в `schema.ts`:

```typescript
export const schema = appSchema({
  version: 2, // Увеличьте версию
  tables: [...]
});
```

## Шифрование

Для включения шифрования базы данных используйте SQLCipher. В Expo это требует нативной конфигурации:

```typescript
// Для bare React Native
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { setEncryptionKey } from '@nozbe/watermelondb/adapters/sqlite/encryption';

// Установите ключ шифрования
setEncryptionKey('your-encryption-key');

const adapter = new SQLiteAdapter({
  schema,
  migrations,
  dbName: 'masterprofi.db',
});
```

**Примечание:** Для Expo может потребоваться использование expo-crypto для генерации ключа.

## Best Practices

1. **Всегда используйте database.write()** для изменений
2. **Индексируйте часто используемые поля** (isIndexed: true)
3. **Используйте связи (relations)** вместо хранения ID
4. **Отслеживайте статус синхронизации** для UX
5. **Обрабатывайте конфликты** явно
6. **Тестируйте миграции** перед продакшеном
7. **Используйте batch операции** для множественных изменений

## Производительность

- ВодmelonDB оптимизирован для больших объемов данных
- Используйте пагинацию для больших списков
- Индексируйте поля для быстрого поиска
- Используйте наблюдаемые (observables) для реактивных обновлений

## Отладка

```typescript
// Сброс базы данных (только для разработки)
import { resetDatabase } from './database/database';
await resetDatabase();

// Проверка количества записей
const ordersCount = await database.collections.get('orders').query().fetchCount();
console.log('Total orders:', ordersCount);
```

## Troubleshooting

### Ошибка "Table not found"

Убедитесь, что:
- Схема корректна
- Миграции применены
- База данных инициализирована

### Данные не синхронизируются

Проверьте:
- Статус сети
- Авторизацию (токен)
- Backend API endpoints
- Логи синхронизации

### Конфликты не разрешаются

Убедитесь, что:
- Стратегия конфликт-резолюции выбрана
- Серверный API возвращает корректные данные
- Локальные изменения помечены как `isSynced: false`








