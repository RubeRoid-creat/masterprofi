# Code Splitting & Dynamic Imports

Реализация code splitting с динамическими импортами для оптимизации размера бандла и улучшения производительности.

## Реализованные функции

✅ **Knowledge Base Screens** - Ленивая загрузка экранов базы знаний
✅ **MLM Network Visualization** - Ленивая загрузка визуализации сети
✅ **Earnings Charts** - Ленивая загрузка графиков доходов
✅ **Map Components** - Ленивая загрузка компонентов карты
✅ **Chat Media Viewer** - Ленивая загрузка медиа-просмотрщика
✅ **React.lazy Implementation** - Использование React.lazy для всех компонентов
✅ **Preloading Strategies** - Стратегии предзагрузки
✅ **Bundle Analysis Setup** - Настройка анализа бандла

## Lazy Components

### Knowledge Base

```tsx
import { KnowledgeBaseScreen } from '../components/lazy';

// Component is automatically wrapped with Suspense
<KnowledgeBaseScreen />
```

### MLM Network

```tsx
import { NetworkTree, MLMDashboardScreen } from '../components/lazy';

<NetworkTree rootMember={member} />
<MLMDashboardScreen currentUserId={userId} />
```

### Earnings Charts

```tsx
import { IncomeBreakdown, EarningsProjection, EarningsScreen } from '../components/lazy';

<IncomeBreakdown breakdown={data} />
<EarningsProjection projections={data} />
```

### Map Components

```tsx
import { OrderMapView, NavigationButton } from '../components/lazy';

<OrderMapView orders={orders} />
<NavigationButton destination={coords} />
```

### Chat Media Viewer

```tsx
import { MediaAttachment, ChatScreen } from '../components/lazy';

<MediaAttachment />
<ChatScreen chat={chat} />
```

## Preloading Strategies

### Priority-Based Preloading

```tsx
import { priorityPreloader } from '../utils/lazyLoading';
import { LazyChatScreen } from '../components/lazy';

// Add to preloader with priority
priorityPreloader.add(LazyChatScreen, 'high'); // 'high' | 'medium' | 'low'
```

### Hook-Based Preloading

```tsx
import { usePreload } from '../hooks/usePreload';
import { LazyChatScreen } from '../components/lazy';

// Preload on mount
usePreload(LazyChatScreen, {
  priority: 'high',
  trigger: 'mount',
});

// Preload on idle
usePreload(LazyChatScreen, {
  priority: 'medium',
  trigger: 'idle',
  delay: 2000,
});

// Preload on focus
usePreload(LazyChatScreen, {
  priority: 'high',
  trigger: 'focus',
});
```

### Preload on Navigation Focus

```tsx
import { usePreloadOnFocus } from '../hooks/usePreload';
import { LazyChatScreen } from '../components/lazy';

// Automatically preloads when screen gains focus
usePreloadOnFocus(LazyChatScreen);
```

### Preload Adjacent Screens

```tsx
import { usePreloadAdjacentScreens } from '../hooks/usePreload';

// Preloads screens likely to be visited next
usePreloadAdjacentScreens('OrdersTab');
```

## Navigation Integration

### Automatic Preloading

Навигаторы автоматически предзагружают компоненты при переходе на экраны:

```tsx
// NetworkNavigator automatically preloads NetworkTree
<NetworkNavigator />

// EarningsNavigator automatically preloads charts
<EarningsNavigator />
```

### Tab Preloading

Каждая вкладка предзагружает связанные компоненты:

- **OrdersTab**: ChatScreen, OrderMapView
- **NetworkTab**: NetworkTree, MLMDashboardScreen
- **EarningsTab**: IncomeBreakdown, EarningsProjection
- **ProfileTab**: KnowledgeBaseScreen

## Bundle Analysis

### Setup

```bash
# Install dependencies (if using webpack)
npm install --save-dev webpack-bundle-analyzer

# For Metro (React Native)
npm install --save-dev metro-bundler-plugin
```

### Analyze Bundle

```bash
# Run bundle analysis
npm run analyze

# Or with environment variable
ANALYZE_BUNDLE=true npm start
```

### Bundle Report

После анализа будет создан отчет:
- `dist/bundle-report.html` - Визуальный отчет
- `dist/bundle-stats.json` - JSON статистика

## Best Practices

1. **Lazy Load Heavy Components** - Используйте lazy для больших компонентов
2. **Preload Strategically** - Предзагружайте компоненты заранее
3. **Priority-Based Loading** - Используйте приоритеты для важных компонентов
4. **Monitor Bundle Size** - Регулярно анализируйте размер бандла
5. **Code Split by Route** - Разделяйте код по маршрутам
6. **Lazy Load Third-Party Libraries** - Ленивая загрузка тяжелых библиотек

## Performance Tips

### Reduce Initial Bundle

- Используйте lazy для неосновных экранов
- Разделяйте vendor chunks
- Минимизируйте зависимости в основных файлах

### Optimize Preloading

- Предзагружайте только важные компоненты
- Используйте idle time для preloading
- Избегайте preloading всех компонентов одновременно

### Monitor Splitting Effectiveness

```tsx
// Check if component is loaded
console.log('Component loaded:', component._payload?._status === 'fulfilled');
```

## Custom Loading Components

```tsx
import { withSuspense } from '../utils/lazyLoading';
import { LazyChatScreen } from '../components/lazy';

const CustomLoading = () => (
  <View>
    <Text>Loading chat...</Text>
  </View>
);

const ChatScreen = withSuspense(LazyChatScreen, CustomLoading, 'Loading chat...');
```

## Troubleshooting

### Component Not Loading

1. Проверьте что компонент экспортирован правильно
2. Убедитесь что используется Suspense
3. Проверьте ошибки в консоли

### Preloading Not Working

1. Убедитесь что hook вызывается
2. Проверьте приоритеты
3. Проверьте что компонент lazy-loaded

### Bundle Size Not Reduced

1. Проверьте что компоненты действительно lazy-loaded
2. Убедитесь что не импортируются напрямую
3. Проверьте vendor chunks








