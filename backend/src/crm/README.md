# CRM Синхронизация Модуль

Модуль для синхронизации данных между мобильным приложением и внешними CRM системами (AmoCRM, Bitrix24).

## Архитектура

```
Мобильное приложение ←→ REST API (NestJS) ←→ CRM API (AmoCRM/Bitrix24)
```

## API Endpoints

### Первоначальная синхронизация
```
GET /api/sync/initial?crmType=amocrm
```
Загружает все данные из CRM системы.

### Инкрементальная синхронизация
```
GET /api/sync/incremental?since=2024-01-15T10:30:00Z&crmType=amocrm
```
Загружает только изменения с указанного времени.

### Отправка изменений
```
POST /api/sync/outgoing
Body: {
  changes: [
    {
      entityId: "uuid",
      entityType: "contact",
      operation: "CREATE|UPDATE|DELETE",
      payload: {...}
    }
  ]
}
```

### Статус синхронизации
```
GET /api/sync/status
```

## Сущности

- **Contact** - Контакты
- **Deal** - Сделки
- **Task** - Задачи
- **Communication** - Коммуникации
- **Product** - Товары/услуги
- **SyncQueue** - Очередь синхронизации
- **SyncStatus** - Статус синхронизации

## Следующие шаги

1. Реализовать интеграцию с AmoCRM API
2. Реализовать интеграцию с Bitrix24 API
3. Добавить обработку конфликтов
4. Добавить retry логику для failed синхронизаций
5. Добавить метрики и мониторинг





