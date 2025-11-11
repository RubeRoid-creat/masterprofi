# WatermelonDB Database Schema

Полная схема базы данных для офлайн-поддержки с синхронизацией и шифрованием.

## Таблицы

### SyncStatus
Отслеживает статус синхронизации для каждой таблицы.

### Clients
Клиенты с информацией о контактах и рейтинге.

### Orders
Заказы с полной информацией о приборах, местоположении и статусе.

### Messages
Сообщения в чатах заказов с поддержкой различных типов контента.

### Parts
Каталог запчастей с информацией о наличии и совместимости.

### KnowledgeBaseArticles
Статьи базы знаний с поддержкой офлайн-загрузки.

### OrderPhotos
Фотографии заказов.

### OrderParts
Связь заказов и запчастей (Many-to-Many).

## Миграции

Миграции находятся в `migrations/index.ts`. Для добавления новой миграции:

```typescript
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

## Синхронизация

Сервис синхронизации автоматически:
- Вытягивает изменения с сервера
- Отправляет локальные изменения
- Обрабатывает конфликты
- Обновляет статус синхронизации

## Использование

```typescript
import { database } from './database/database';
import { Order } from './database/models/Order';

// Создать заказ
await database.write(async () => {
  await database.collections.get('orders').create((order) => {
    order.orderNumber = 'ORD-001';
    order.status = 'new';
    // ...
  });
});

// Запрос заказов
const orders = await database.collections
  .get('orders')
  .query(Q.where('status', 'new'))
  .fetch();
```

## Шифрование

Для включения шифрования используйте SQLCipher:

```typescript
const adapter = new SQLiteAdapter({
  schema,
  migrations,
  // Enable encryption
  dbName: 'masterprofi.db',
  // Configure encryption key
});
```








