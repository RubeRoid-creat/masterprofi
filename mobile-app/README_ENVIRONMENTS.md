# Multi-Environment Configuration

Полная настройка мультиокружений для Development, Staging, и Production с feature flags, аналитикой и crash reporting.

## Реализованные компоненты

✅ **Development Environment** - Локальные API и отладка
✅ **Staging Environment** - Тестовая среда
✅ **Production Environment** - Продакшн API
✅ **Feature Flags System** - Централизованная система feature flags
✅ **Analytics Configuration** - Конфигурация аналитики
✅ **Crash Reporting Setup** - Настройка crash reporting

## Структура

```
src/config/
├── environments.ts        # Конфигурация окружений
├── featureFlags.ts        # Система feature flags

src/services/
├── analyticsService.ts    # Сервис аналитики
├── crashReportingService.ts # Сервис crash reporting

src/utils/
├── logger.ts              # Логгер с учетом окружения
├── errorHandler.ts        # Глобальный обработчик ошибок

src/store/api/
└── baseQuery.ts          # Base query с конфигурацией окружения
```

## Окружения

### Development

```typescript
{
  apiUrl: 'http://localhost:3000/api',
  enableLogging: true,
  enableAnalytics: false,
  enableCrashReporting: false,
}
```

### Staging

```typescript
{
  apiUrl: 'https://api-staging.masterprofi.com/api',
  enableLogging: true,
  enableAnalytics: true,
  enableCrashReporting: true,
}
```

### Production

```typescript
{
  apiUrl: 'https://api.masterprofi.com/api',
  enableLogging: false,
  enableAnalytics: true,
  enableCrashReporting: true,
}
```

## Использование

### Определение окружения

```typescript
import { config, isDevelopment, isStaging, isProduction } from './src/config/environments';

if (isDevelopment) {
  // Development-only code
}
```

### Feature Flags

```typescript
import { useFeatureFlag } from './src/hooks/useFeatureFlag';

const MyComponent = () => {
  const isMLMEnabled = useFeatureFlag('enableMLM');
  
  if (!isMLMEnabled) {
    return null;
  }
  
  return <MLMComponent />;
};
```

### Analytics

```typescript
import { analyticsService } from './src/services/analyticsService';

// Track event
analyticsService.track('order_created', {
  orderId: '123',
  amount: 3000,
});

// Track screen view
analyticsService.trackScreenView('OrderFeed');

// Set user ID
analyticsService.setUserId('user-123');
```

### Crash Reporting

```typescript
import { crashReportingService } from './src/services/crashReportingService';

try {
  // Your code
} catch (error) {
  crashReportingService.captureException(error, {
    tags: { feature: 'orders' },
    extra: { orderId: '123' },
  });
}
```

### Logger

```typescript
import { logger } from './src/utils/logger';

logger.debug('Debug message');
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message', error);
```

## Конфигурация

### Environment Variables

Создайте `.env` файл на основе `.env.example`:

```bash
EXPO_PUBLIC_ENV=development
EXPO_PUBLIC_API_URL_DEV=http://localhost:3000/api
EXPO_PUBLIC_API_URL_STAGING=https://api-staging.masterprofi.com/api
EXPO_PUBLIC_API_URL_PROD=https://api.masterprofi.com/api
```

### EAS Build

Окружения автоматически устанавливаются в `eas.json`:

- **development**: `EXPO_PUBLIC_ENV=development`
- **staging**: `EXPO_PUBLIC_ENV=staging`
- **production**: `EXPO_PUBLIC_ENV=production`

## Feature Flags

### Доступные флаги

- `enableMLM` - MLM функциональность
- `enableKnowledgeBase` - База знаний
- `enableOfflineMode` - Офлайн режим
- `enablePushNotifications` - Push уведомления
- `enableBiometricAuth` - Биометрическая аутентификация
- `enableAdvancedAnalytics` - Продвинутая аналитика
- `enableBetaFeatures` - Бета функции

### Управление флагами

```typescript
import { featureFlags } from './src/config/featureFlags';

// Проверить флаг
if (featureFlags.isEnabled('enableMLM')) {
  // Show MLM features
}

// Переопределить локально
await featureFlags.setFlag('enableMLM', false);

// Получить все флаги
const allFlags = featureFlags.getAllFlags();
```

## Analytics

### События

- `screen_view` - Просмотр экрана
- `order_created` - Создание заказа
- `order_accepted` - Принятие заказа
- `order_completed` - Завершение заказа
- `message_sent` - Отправка сообщения
- `payment_completed` - Завершение платежа
- `user_registered` - Регистрация пользователя
- `user_logged_in` - Вход пользователя

### Примеры

```typescript
// Track order creation
analyticsService.track('order_created', {
  orderId: order.id,
  amount: order.price.amount,
  status: order.status,
});

// Track screen view
analyticsService.trackScreenView('OrderDetails', {
  orderId: order.id,
});

// Track user action
analyticsService.trackAction('button_click', {
  buttonName: 'accept_order',
  screen: 'OrderDetails',
});

// Track performance
analyticsService.trackPerformance('api_request', 250, 'ms');
```

## Crash Reporting

### Настройка Sentry

1. Установите пакет:
```bash
npm install @sentry/react-native
```

2. Добавьте DSN в `.env`:
```
EXPO_PUBLIC_SENTRY_DSN_PROD=https://your-dsn@sentry.io/project-id
```

3. Инициализация происходит автоматически в `App.tsx`

### Использование

```typescript
// Capture exception
crashReportingService.captureException(error, {
  tags: { feature: 'orders' },
  extra: { orderId: '123' },
  level: 'error',
});

// Capture message
crashReportingService.captureMessage('Something went wrong', 'warning');

// Add breadcrumb
crashReportingService.addBreadcrumb('User action', 'navigation', {
  screen: 'OrderDetails',
});
```

## Build Commands

### Development

```bash
eas build --profile development --platform ios
eas build --profile development --platform android
```

### Staging

```bash
eas build --profile staging --platform ios
eas build --profile staging --platform android
```

### Production

```bash
eas build --profile production --platform ios
eas build --profile production --platform android
```

## Environment Indicator

Компонент для отображения текущего окружения:

```tsx
import { EnvironmentIndicator } from './src/components/EnvironmentIndicator';

<EnvironmentIndicator />
```

Показывается только в development и staging.

## Best Practices

1. **Never Commit .env** - Добавьте в .gitignore
2. **Use Feature Flags** - Для постепенного rollout
3. **Test All Environments** - Тестируйте все окружения
4. **Monitor Analytics** - Следите за метриками
5. **Review Crash Reports** - Регулярно проверяйте crash reports
6. **Environment-Specific Logging** - Логируйте только в dev/staging

## Troubleshooting

### Wrong Environment

Убедитесь что `EXPO_PUBLIC_ENV` установлен правильно в `.env` или `eas.json`.

### Feature Flags Not Working

1. Проверьте что `featureFlags.initialize()` вызван
2. Проверьте что флаг существует в конфигурации
3. Проверьте remote flags (если используются)

### Analytics Not Tracking

1. Убедитесь что `enableAnalytics: true` в конфигурации
2. Проверьте tracking ID
3. Проверьте что сервис инициализирован

### Crash Reporting Not Working

1. Проверьте что DSN установлен
2. Убедитесь что сервис инициализирован
3. Проверьте права доступа








