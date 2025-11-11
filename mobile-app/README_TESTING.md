# Testing Documentation

Комплексная система тестирования с Jest и React Native Testing Library.

## Реализованные тесты

✅ **Order Card Tests** - Рендеринг и взаимодействия
✅ **Form Validation Tests** - Валидация форм
✅ **Navigation Tests** - Навигационные потоки
✅ **State Management Tests** - Redux store и slices
✅ **Error Scenarios Tests** - Обработка ошибок
✅ **Accessibility Tests** - Тестирование доступности
✅ **Async Operations Tests** - Асинхронные операции
✅ **Snapshot Tests** - Снапшот тестирование
✅ **Mock API Responses** - Мокирование API

## Установка

```bash
npm install --save-dev @testing-library/react-native @testing-library/jest-native jest jest-react-native @types/jest react-test-renderer
```

## Запуск тестов

```bash
# Запустить все тесты
npm test

# Запустить в watch mode
npm run test:watch

# С coverage
npm run test:coverage
```

## Структура тестов

```
src/__tests__/
├── setup.ts                 # Jest setup и моки
├── __mocks__/
│   └── apiMocks.ts          # Моки API ответов
├── OrderCard.test.tsx       # Тесты OrderCard компонента
├── validation.test.ts       # Тесты валидации
├── navigation.test.tsx      # Тесты навигации
├── stateManagement.test.ts  # Тесты Redux
├── errorScenarios.test.tsx  # Тесты ошибок
├── accessibility.test.tsx     # Тесты доступности
└── asyncOperations.test.ts   # Тесты async операций
```

## Примеры тестов

### Component Testing

```tsx
import { render, fireEvent } from '@testing-library/react-native';
import { OrderCard } from '../components/orders/OrderCard';

it('should render order card', () => {
  const { getByText } = render(
    <OrderCard
      orderId="order-1"
      clientName="John Doe"
      applianceType="washing_machine"
      address="Moscow"
      distance={2.5}
      price={3000}
      status="new"
      urgency="normal"
      onPress={() => {}}
    />
  );

  expect(getByText('John Doe')).toBeTruthy();
});
```

### Async Testing

```tsx
it('should fetch orders', async () => {
  const result = await store.dispatch(
    ordersApi.endpoints.getOrders.initiate({ status: 'new' })
  );

  expect(result.isSuccess).toBe(true);
});
```

### Snapshot Testing

```tsx
it('should match snapshot', () => {
  const { toJSON } = render(<OrderCard {...props} />);
  expect(toJSON()).toMatchSnapshot();
});
```

### Accessibility Testing

```tsx
it('should have accessible label', () => {
  const { getByLabelText } = render(<OrderCard {...props} />);
  expect(getByLabelText('Order from John Doe')).toBeTruthy();
});
```

## Mock API Responses

```tsx
import { mockOrders, mockApiResponse } from './__mocks__/apiMocks';

// Использование моков
(global.fetch as jest.Mock).mockResolvedValueOnce({
  ok: true,
  json: async () => mockApiResponse,
});
```

## Best Practices

1. **Test Behavior, Not Implementation** - Тестируйте поведение, а не реализацию
2. **Use Descriptive Test Names** - Используйте понятные имена тестов
3. **Mock External Dependencies** - Мокируйте внешние зависимости
4. **Test User Interactions** - Тестируйте взаимодействия пользователя
5. **Test Error Scenarios** - Тестируйте сценарии ошибок
6. **Maintain Test Coverage** - Поддерживайте покрытие тестами (>70%)

## Coverage Goals

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## Troubleshooting

### Tests not running

1. Проверьте Jest конфигурацию
2. Убедитесь что все зависимости установлены
3. Проверьте setup файл

### Mock errors

1. Убедитесь что моки правильно настроены
2. Проверьте пути к мокам
3. Очистите кэш Jest: `npm test -- --clearCache`








