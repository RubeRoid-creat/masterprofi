# 🔐 Система безопасности MasterProfi

## ✅ Реализованные функции

### 1. Refresh Tokens

#### Функциональность:
- ✅ Генерация refresh токенов при логине
- ✅ Хранение токенов в базе данных с привязкой к пользователю
- ✅ Автоматическая валидация и обновление access токенов
- ✅ Отзыв токенов при выходе
- ✅ Отзыв всех сессий пользователя
- ✅ Трекинг IP-адресов и User-Agent

#### API Endpoints:
- `POST /api/auth/login` - Возвращает `access_token` и `refresh_token`
- `POST /api/auth/refresh` - Обновляет access token
- `POST /api/auth/logout` - Отзывает refresh token

#### Настройки (.env):
```env
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=30d
```

---

### 2. Rate Limiting

#### Настройки:
- **Default**: 100 запросов в минуту (для всех эндпоинтов)
- **Auth**: 5 попыток входа в минуту
- **Register**: 3 регистрации в минуту
- **Strict**: 20 запросов в минуту (для чувствительных операций)

#### Использование:
```typescript
import { Throttle } from '@nestjs/throttler';

@Throttle({ default: { limit: 5, ttl: 60000 } })
@Post('sensitive-operation')
async sensitiveOperation() {
  // Максимум 5 запросов в минуту
}
```

#### Защита от:
- ✅ Brute-force атак на логин
- ✅ DoS атак
- ✅ Массовая регистрация
- ✅ Злоупотребление API

---

### 3. Audit Log (Журнал действий)

#### Функциональность:
- ✅ Автоматическое логирование всех действий пользователей
- ✅ Хранение истории изменений (oldValues/newValues)
- ✅ Трекинг IP-адресов и User-Agent
- ✅ Фильтрация по пользователю, сущности, типу действия

#### Типы действий:
```typescript
enum AuditAction {
  // Auth
  LOGIN, LOGOUT, REGISTER, TOKEN_REFRESH,
  
  // User
  USER_CREATE, USER_UPDATE, USER_DELETE,
  USER_ACTIVATE, USER_DEACTIVATE,
  
  // Orders
  ORDER_CREATE, ORDER_UPDATE, ORDER_DELETE,
  ORDER_STATUS_CHANGE,
  
  // Payments
  PAYMENT_CREATE, PAYMENT_UPDATE, PAYMENT_DELETE,
  PAYMENT_STATUS_CHANGE,
  
  // MLM
  MLM_COMMISSION_CALCULATED, MLM_BONUS_CREATED,
  MLM_BONUS_PAID,
  
  // System
  SETTINGS_UPDATE, CONFIG_CHANGE,
}
```

#### API Endpoints:
- `GET /api/audit` - Все логи (лимит 100)
- `GET /api/audit/user/:userId` - Логи пользователя
- `GET /api/audit/entity/:entityType/:entityId` - Логи по сущности

#### Использование:
```typescript
import { AuditService } from './audit/audit.service';
import { AuditAction } from './audit/entities/audit-log.entity';

await auditService.log(AuditAction.ORDER_UPDATE, 'order', {
  userId: user.id,
  entityId: order.id,
  description: 'Order status changed',
  oldValues: { status: 'created' },
  newValues: { status: 'completed' },
  ipAddress: req.ip,
  userAgent: req.get('user-agent'),
});
```

---

## 📊 Структура данных

### RefreshToken Entity
```typescript
{
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  isActive: boolean;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}
```

### AuditLog Entity
```typescript
{
  id: string;
  userId?: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  description?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}
```

---

## 🚀 Применение

### 1. При логине:
- Создается access token (1 час)
- Создается refresh token (30 дней)
- Логируется действие LOGIN с IP и User-Agent

### 2. При обновлении токена:
- Валидируется refresh token
- Выдается новый access token
- Логируется действие TOKEN_REFRESH

### 3. При выходе:
- Refresh token деактивируется
- Логируется действие LOGOUT

### 4. Rate Limiting:
- Автоматически применяется ко всем эндпоинтам
- Специальные лимиты для auth операций
- Защита от злоупотреблений

---

## 🔒 Рекомендации по безопасности

1. **Production настройки:**
   - Измените `JWT_SECRET` и `JWT_REFRESH_SECRET` на случайные строки
   - Используйте HTTPS для передачи токенов
   - Настройте CORS правильно

2. **Rate Limiting:**
   - Настройте лимиты под ваши нужды
   - Используйте Redis для распределенного rate limiting

3. **Audit Log:**
   - Регулярно архивируйте старые логи
   - Мониторьте подозрительную активность
   - Используйте для compliance

---

## 📝 Следующие шаги

1. Добавить интеграцию Audit Log в другие сервисы (Orders, Payments, Users)
2. Настроить Redis для распределенного rate limiting
3. Добавить email верификацию
4. Реализовать 2FA (двухфакторная аутентификация)
5. Добавить роли и права доступа (RBAC)

