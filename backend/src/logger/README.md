# Централизованное логирование

Система логирования основана на Winston и поддерживает:

## Возможности

- **Уровни логирования**: error, warn, info, debug, verbose
- **Файловые логи**: автоматическая ротация по дням с архивацией
- **Структурированное логирование**: JSON формат для файлов
- **Консольный вывод**: цветной формат для разработки
- **Отдельные логи**: общий лог, лог ошибок, лог HTTP запросов
- **Обработка исключений**: автоматическое логирование unhandled exceptions и rejections

## Настройка

Переменные окружения в `.env`:

```env
# Логирование
LOG_LEVEL=debug                    # Уровень логирования (error, warn, info, debug, verbose)
LOG_DIR=./logs                     # Директория для логов
ENABLE_FILE_LOGGING=true          # Включать файловое логирование (true/false)
NODE_ENV=development               # Окружение (development/production)
```

## Использование

### В сервисах

```typescript
import { LoggerService } from "../logger/logger.service";

@Injectable()
export class MyService {
  constructor(private logger: LoggerService) {}

  someMethod() {
    // Простое логирование
    this.logger.log("Operation started", "MyService");
    
    // С метаданными
    this.logger.logWithMeta("User action", {
      userId: "123",
      action: "login",
      ip: "192.168.1.1"
    }, "MyService");
    
    // Ошибка
    try {
      // ...
    } catch (error) {
      this.logger.errorWithMeta("Operation failed", error, "MyService");
    }
    
    // Бизнес-событие
    this.logger.logBusinessEvent("order_created", {
      orderId: "order-123",
      amount: 5000,
      clientId: "client-456"
    }, "OrdersService");
    
    // Событие безопасности
    this.logger.logSecurityEvent("failed_login_attempt", {
      email: "user@example.com",
      ip: "192.168.1.1",
      reason: "invalid_password"
    });
  }
}
```

## Структура логов

### application-YYYY-MM-DD.log
Все логи приложения (info, debug, warn)

### error-YYYY-MM-DD.log
Только ошибки (error уровень)

### http-YYYY-MM-DD.log
HTTP запросы и ответы

### exceptions.log
Необработанные исключения

### rejections.log
Необработанные Promise rejections

## Ротация логов

- Максимальный размер файла: 20MB
- Хранение ошибок: 30 дней
- Хранение HTTP логов: 7 дней
- Хранение общих логов: 14 дней
- Автоматическая архивация старых файлов

