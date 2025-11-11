# Система алертов

Автоматическое отслеживание критических событий и отправка уведомлений.

## Возможности

- **Автоматическая проверка метрик** по расписанию
- **Настраиваемые правила** алертов
- **Уведомления** через Email, Slack, Webhook
- **История алертов** с фильтрацией
- **Cooldown период** для предотвращения спама

## Предустановленные правила

### high_error_rate
- **Условие**: Более 10 ошибок за минуту
- **Уровень**: Critical
- **Cooldown**: 5 минут

### high_response_time
- **Условие**: Время ответа > 5 секунд
- **Уровень**: Warning
- **Cooldown**: 10 минут

### low_cache_hit_rate
- **Условие**: Более 1000 промахов кэша за минуту
- **Уровень**: Warning
- **Cooldown**: 10 минут

### database_connection_issues
- **Условие**: Более 500 запросов к БД за минуту
- **Уровень**: Warning
- **Cooldown**: 5 минут

### auth_failure_spike
- **Условие**: Более 20 неудачных попыток входа за минуту
- **Уровень**: Critical
- **Cooldown**: 3 минуты

## Настройка

### Переменные окружения

```env
# Email уведомления
ALERTS_EMAIL_ENABLED=true
ALERTS_EMAIL_TO=admin@masterprofi.ru

# Slack уведомления
ALERTS_SLACK_ENABLED=true
ALERTS_SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Webhook уведомления
ALERTS_WEBHOOK_ENABLED=true
ALERTS_WEBHOOK_URL=https://your-monitoring-service.com/webhook
```

### Slack Webhook

1. Создайте Incoming Webhook в Slack
2. Добавьте URL в `ALERTS_SLACK_WEBHOOK`
3. Включите `ALERTS_SLACK_ENABLED=true`

## API

### Получить историю алертов

```bash
GET /api/alerts/history?limit=50
```

### Получить все правила

```bash
GET /api/alerts/rules
```

### Добавить правило

```bash
POST /api/alerts/rules
Content-Type: application/json

{
  "name": "custom_alert",
  "metric": "masterprofi_errors_total",
  "condition": "gt",
  "threshold": 50,
  "duration": 300,
  "severity": "critical",
  "enabled": true,
  "cooldown": 600
}
```

### Обновить правило

```bash
PUT /api/alerts/rules/:name
Content-Type: application/json

{
  "threshold": 100,
  "severity": "warning"
}
```

### Включить/выключить правило

```bash
POST /api/alerts/rules/:name/toggle
Content-Type: application/json

{
  "enabled": false
}
```

### Ручная проверка алертов

```bash
POST /api/alerts/check
```

## Создание кастомного правила

```typescript
const rule: AlertRule = {
  name: "high_payment_failure_rate",
  metric: "masterprofi_payments_processed_total",
  condition: "gt",
  threshold: 100, // Более 100 платежей
  duration: 60, // За минуту
  severity: "warning",
  enabled: true,
  cooldown: 300, // 5 минут между алертами
};

alertsService.addAlertRule(rule);
```

## Расписание проверки

Для автоматической проверки добавьте в модуль:

```typescript
import { Cron } from "@nestjs/schedule";

@Injectable()
export class AlertsScheduler {
  constructor(private alertsService: AlertsService) {}

  @Cron("*/30 * * * * *") // Каждые 30 секунд
  checkAlerts() {
    this.alertsService.checkAlerts();
  }
}
```

## Формат уведомлений

### Slack

```json
{
  "text": "MasterProfi Alert",
  "attachments": [{
    "color": "danger",
    "title": "CRITICAL: high_error_rate",
    "text": "Alert message",
    "fields": [...]
  }]
}
```

### Webhook

```json
{
  "service": "masterprofi-backend",
  "alert": {
    "name": "high_error_rate",
    "severity": "critical",
    "message": "...",
    "metric": "...",
    "threshold": 10,
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

