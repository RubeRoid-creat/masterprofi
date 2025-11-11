# Метрики производительности (Prometheus)

Система метрик основана на Prometheus и предоставляет endpoint `/api/metrics` для сбора метрик.

## Доступные метрики

### HTTP метрики
- `masterprofi_http_request_duration_seconds` - Длительность HTTP запросов
- `masterprofi_http_requests_total` - Общее количество HTTP запросов
- `masterprofi_http_requests_in_progress` - Количество активных запросов

### База данных
- `masterprofi_db_query_duration_seconds` - Длительность запросов к БД
- `masterprofi_db_queries_total` - Общее количество запросов к БД
- `masterprofi_db_connections_active` - Количество активных соединений

### Бизнес метрики
- `masterprofi_orders_created_total` - Созданные заказы
- `masterprofi_orders_completed_total` - Завершенные заказы
- `masterprofi_payments_processed_total` - Обработанные платежи
- `masterprofi_payments_amount_total` - Сумма платежей (рублей)
- `masterprofi_users_registered_total` - Зарегистрированные пользователи
- `masterprofi_auth_attempts_total` - Попытки авторизации
- `masterprofi_auth_failures_total` - Неудачные попытки авторизации

### Системные метрики
- `masterprofi_cache_hits_total` - Попадания в кэш
- `masterprofi_cache_misses_total` - Промахи кэша
- `masterprofi_websocket_connections` - Активные WebSocket соединения
- `masterprofi_websocket_messages_total` - Отправленные WebSocket сообщения

### Метрики ошибок
- `masterprofi_errors_total` - Общее количество ошибок
- `masterprofi_errors_by_type_total` - Ошибки по типам

### Стандартные Node.js метрики
- `masterprofi_process_cpu_user_seconds_total`
- `masterprofi_process_cpu_system_seconds_total`
- `masterprofi_process_resident_memory_bytes`
- И другие стандартные метрики Node.js

## Использование

### Получение метрик

```bash
curl http://localhost:3000/api/metrics
```

### Использование в сервисах

```typescript
import { MetricsService } from "../metrics/metrics.service";

@Injectable()
export class OrdersService {
  constructor(private metrics: MetricsService) {}

  async create(order: CreateOrderDto) {
    // Инкрементируем счетчик созданных заказов
    this.metrics.ordersCreated.inc({ status: "created" });
    
    // ... логика создания заказа
  }

  async complete(orderId: string) {
    // Инкрементируем счетчик завершенных заказов
    this.metrics.ordersCompleted.inc();
    
    // ... логика завершения заказа
  }
}
```

## Интеграция с Prometheus

### Настройка Prometheus

Добавьте в `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'masterprofi-backend'
    scrape_interval: 15s
    static_configs:
      - targets: ['localhost:3000']
        metrics_path: '/api/metrics'
```

### Grafana Dashboard

Импортируйте готовые дашборды для:
- HTTP запросов
- Производительности БД
- Бизнес-метрик
- Системных метрик

## Примеры запросов PromQL

```promql
# Среднее время ответа за последние 5 минут
rate(masterprofi_http_request_duration_seconds_sum[5m]) / rate(masterprofi_http_request_duration_seconds_count[5m])

# Количество ошибок за последний час
rate(masterprofi_errors_total[1h])

# Процент попаданий в кэш
rate(masterprofi_cache_hits_total[5m]) / (rate(masterprofi_cache_hits_total[5m]) + rate(masterprofi_cache_misses_total[5m]))

# Количество активных WebSocket соединений
masterprofi_websocket_connections
```

