# Analytics Integration Guide

Полное руководство по интегрированной системе аналитики.

## Реализованные компоненты

✅ **User Engagement Metrics** - Метрики вовлеченности пользователей
✅ **Order Completion Rates** - Процент завершения заказов
✅ **Feature Usage Tracking** - Отслеживание использования функций
✅ **Performance Monitoring** - Мониторинг производительности
✅ **Crash Reporting** - Расширенная отчетность о сбоях
✅ **User Flow Analysis** - Анализ пользовательских потоков

## Сервисы аналитики

### 1. User Engagement Service

Отслеживает вовлеченность пользователей:

```typescript
import { userEngagementService } from './src/services/userEngagementService';

// Автоматически инициализируется
// Используйте хук для отслеживания экранов
import { useScreenTracking } from './src/hooks/useAnalytics';

function MyScreen() {
  useScreenTracking('MyScreen');
  // ...
}

// Или вручную
userEngagementService.trackScreenView('OrderFeed');
userEngagementService.trackInteraction('tap', 'accept_button');
userEngagementService.trackFeatureUsage('MLM Network');
```

**Метрики:**
- Session duration
- Screen views
- Interactions count
- Active days
- Time spent per screen
- Feature usage count

### 2. Order Analytics Service

Отслеживает метрики заказов:

```typescript
import { orderAnalyticsService } from './src/services/orderAnalyticsService';

// Track order events
orderAnalyticsService.trackOrderCreated(orderId, 'washing_machine', 3000);
orderAnalyticsService.trackOrderAccepted(orderId);
orderAnalyticsService.trackOrderStarted(orderId);
orderAnalyticsService.trackOrderCompleted(orderId, completionTime);
orderAnalyticsService.trackOrderCancelled(orderId, 'user_requested');

// Get completion rate
const completionRate = await orderAnalyticsService.getCompletionRate('month');

// Get all metrics
const metrics = await orderAnalyticsService.getMetrics('week');
console.log(`Completion Rate: ${metrics.completionRate}%`);
```

**Метрики:**
- Total orders
- Completed orders
- Cancelled orders
- Average completion time
- Completion rate
- Orders by status
- Orders by category
- Revenue
- Average order value

### 3. Feature Usage Service

Отслеживает использование функций:

```typescript
import { featureUsageService } from './src/services/featureUsageService';
import { useFeatureTracking } from './src/hooks/useAnalytics';

// Using hook
function MyFeature() {
  useFeatureTracking('Repair Calculator', 'tools');
  // ...
}

// Or manually
featureUsageService.trackFeatureStart('MLM Dashboard', 'network');
// ... user uses feature
featureUsageService.trackFeatureEnd('MLM Dashboard');

// Track interactions
featureUsageService.trackFeatureInteraction('Chat', 'send_message', {
  messageLength: 50,
});

// Get stats
const stats = await featureUsageService.getFeatureStats('Chat');
const mostUsed = await featureUsageService.getMostUsedFeatures(10);
```

**Метрики:**
- Usage count per feature
- First/last used timestamp
- Average session time
- Unique users per feature
- Adoption rate

### 4. Performance Monitoring Service

Отслеживает производительность:

```typescript
import { performanceMonitoringService } from './src/services/performanceMonitoringService';
import { usePerformanceTracking } from './src/hooks/useAnalytics';

// Track component render
function MyComponent() {
  usePerformanceTracking('OrderCard');
  // ...
}

// Track API calls (automatic in baseQuery)
// Track screen render (automatic with useScreenTracking)

// Get average metrics
const metrics = performanceMonitoringService.getAverageMetrics();
console.log('Average API response time:', metrics.averageApiResponseTime);
```

**Метрики:**
- API response times
- Screen render times
- Component render times
- Memory usage
- App start time

**Автоматически отслеживается:**
- Slow API calls (>2s)
- Slow screen renders (>1s)
- High memory usage (>500MB)

### 5. User Flow Service

Отслеживает пользовательские потоки:

```typescript
import { userFlowService } from './src/services/userFlowService';
import { useFlowTracking } from './src/hooks/useAnalytics';

// Using hook
function OrderScreen() {
  useFlowTracking('order_flow', 'OrderFeed');
  // ...
}

// Or manually
userFlowService.startFlow('order_flow', 'OrderFeed');
userFlowService.trackFlowStep('OrderDetails');
userFlowService.trackFlowStep('Payment');
userFlowService.completeFlow('PaymentSuccess');

// Analyze flow
const analysis = await userFlowService.analyzeFlow('order_flow');
console.log(`Completion Rate: ${analysis.completionRate}%`);

// Get funnel
const funnel = await userFlowService.getFlowFunnel('order_flow');
```

**Метрики:**
- Flow starts/completions
- Completion rate
- Average duration
- Common paths
- Dropoff points

### 6. Crash Reporting Service

Расширенная отчетность о сбоях (уже интегрирована):

```typescript
import { crashReportingService } from './src/services/crashReportingService';

crashReportingService.captureException(error, {
  tags: { feature: 'orders' },
  extra: { orderId: '123' },
  level: 'error',
});
```

## Использование хуков

### useScreenTracking

Автоматически отслеживает просмотры экранов и время рендеринга:

```tsx
import { useScreenTracking } from '../hooks/useAnalytics';

function OrderFeedScreen() {
  useScreenTracking('OrderFeed');
  // ...
}
```

### useFeatureTracking

Отслеживает использование функции:

```tsx
import { useFeatureTracking } from '../hooks/useAnalytics';

function ChatScreen() {
  useFeatureTracking('Chat', 'communication');
  // ...
}
```

### useFlowTracking

Отслеживает пользовательский поток:

```tsx
import { useFlowTracking } from '../hooks/useAnalytics';

function RegistrationScreen() {
  useFlowTracking('registration_flow', 'Registration');
  // ...
}
```

### usePerformanceTracking

Отслеживает производительность компонента:

```tsx
import { usePerformanceTracking } from '../hooks/useAnalytics';

function OrderCard({ order }) {
  usePerformanceTracking('OrderCard');
  // ...
}
```

## Интеграция с экранами

### Пример интеграции

```tsx
import { useScreenTracking } from '../hooks/useAnalytics';
import { useFeatureTracking } from '../hooks/useAnalytics';
import { orderAnalyticsService } from '../services/orderAnalyticsService';
import { userEngagementService } from '../services/userEngagementService';

function OrderDetailsScreen({ orderId }) {
  useScreenTracking('OrderDetails');
  useFeatureTracking('Order Details', 'orders');

  const handleAccept = async () => {
    userEngagementService.trackInteraction('button_click', 'accept_order');
    orderAnalyticsService.trackOrderAccepted(orderId);
    // ...
  };

  const handleComplete = async () => {
    orderAnalyticsService.trackOrderCompleted(orderId, completionTime);
    // ...
  };

  return (
    // ...
  );
}
```

## Analytics Dashboard

Компонент для просмотра аналитики (только в dev/staging):

```tsx
import { AnalyticsDashboard } from './src/components/analytics/AnalyticsDashboard';

// В настройках или админ-панели
<AnalyticsDashboard />
```

## Метрики по категориям

### User Engagement

- Session duration
- Daily active users (DAU)
- Screen views per session
- Interactions per session
- Time spent per screen
- Feature adoption rate

### Order Metrics

- Order completion rate
- Average completion time
- Orders by status
- Orders by category
- Revenue trends
- Average order value

### Feature Usage

- Most used features
- Feature adoption rate
- Session time per feature
- Feature retention
- Feature drop-off points

### Performance

- API response times
- Screen render times
- Component render times
- Memory usage trends
- App start time
- Slow operation alerts

### User Flows

- Flow completion rates
- Common navigation paths
- Drop-off points
- Flow duration
- Conversion funnels

## Настройка

### Thresholds (Performance)

```typescript
performanceMonitoringService.updateThresholds({
  apiResponseTime: 3000, // 3 seconds
  screenRenderTime: 1500, // 1.5 seconds
  memoryUsage: 600, // 600 MB
});
```

### Custom Flows

```typescript
userFlowService.registerFlow(
  'custom_flow',
  'Custom Flow Name',
  'StartScreen',
  'EndScreen'
);
```

## Данные и хранение

- Все метрики сохраняются локально в AsyncStorage
- Данные отправляются на сервер через `analyticsService`
- Старые данные автоматически очищаются (90+ дней)
- Ограничение: последние 1000 событий

## Best Practices

1. **Track Early** - Начинайте отслеживание с первого экрана
2. **Meaningful Names** - Используйте понятные имена для событий
3. **Don't Over-track** - Не отслеживайте каждый клик
4. **Privacy** - Соблюдайте приватность пользователей
5. **Performance** - Аналитика не должна замедлять приложение
6. **Test** - Тестируйте аналитику в development

## Troubleshooting

### Метрики не сохраняются
- Проверьте что сервисы инициализированы
- Проверьте доступность AsyncStorage
- Проверьте логи на ошибки

### Производительность
- Метрики собираются асинхронно
- Данные сохраняются батчами
- Старые данные удаляются автоматически

### Отсутствуют данные
- Убедитесь что хуки используются
- Проверьте что события отслеживаются
- Проверьте фильтры по времени








