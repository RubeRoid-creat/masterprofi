# OrderCard Component

Переиспользуемый компонент карточки заказа с поддержкой свайпов, доступности и оптимизацией производительности.

## Props

### Required Props
- `orderId: string` - Уникальный идентификатор заказа
- `clientName: string` - Имя клиента
- `applianceType: string` - Тип прибора
- `address: string` - Адрес обслуживания
- `distance: number` - Расстояние в километрах
- `price: number` - Цена заказа
- `status: OrderStatus` - Статус заказа
- `urgency: 'low' | 'medium' | 'high'` - Срочность заказа
- `onPress: () => void` - Обработчик нажатия на карточку

### Optional Props
- `clientRating?: number` - Рейтинг клиента (0-5)
- `clientAvatar?: string` - URL аватара клиента
- `onAccept?: () => void` - Обработчик принятия заказа
- `onDecline?: () => void` - Обработчик отклонения заказа
- `currency?: string` - Валюта (по умолчанию 'RUB')

## Особенности

✅ **Status Badge** - Цветовая кодировка статусов  
✅ **Distance & Travel Time** - Расстояние и расчетное время в пути  
✅ **Price Display** - Отображение цены с валютой  
✅ **Client Rating** - Отображение рейтинга клиента  
✅ **Quick Actions** - Кнопки быстрых действий (Accept/Decline)  
✅ **Swipe Gestures** - Свайп жесты для действий  
✅ **Accessibility** - Полная поддержка доступности  
✅ **Performance** - Оптимизация через React.memo  

## Использование

### Базовое использование

```tsx
import { OrderCard } from './src/components/orders/OrderCard';

<OrderCard
  orderId="ORD-12345"
  clientName="John Doe"
  applianceType="Washing Machine"
  address="123 Main Street, Moscow"
  distance={2.5}
  price={3500}
  status="new"
  urgency="medium"
  onPress={() => navigateToOrder('ORD-12345')}
/>
```

### С рейтингом и действиями

```tsx
<OrderCard
  orderId="ORD-12346"
  clientName="Jane Smith"
  applianceType="Refrigerator"
  address="456 Oak Avenue, Moscow"
  distance={5.2}
  price={4500}
  status="new"
  urgency="high"
  clientRating={4.8}
  clientAvatar="https://example.com/avatar.jpg"
  onPress={() => navigateToOrder('ORD-12346')}
  onAccept={() => acceptOrder('ORD-12346')}
  onDecline={() => declineOrder('ORD-12346')}
/>
```

## Статусы заказа

Цветовая кодировка:
- **New** - Зеленый (green-100/green-800)
- **Assigned** - Синий (blue-100/blue-800)
- **In Progress** - Желтый (yellow-100/yellow-800)
- **Completed** - Серый (gray-100/gray-800)
- **Cancelled** - Красный (red-100/red-800)

## Срочность

Индикаторы приоритета:
- **High** - Красный индикатор с пульсацией
- **Medium** - Желтый
- **Low** - Зеленый

## Свайп жесты

### Swipe Right (→) - Accept
- Свайп вправо для принятия заказа
- Показывает зеленый фон действия
- Автоматическая анимация при достижении порога

### Swipe Left (←) - Decline
- Свайп влево для отклонения заказа
- Показывает красный фон действия
- Автоматическая анимация при достижении порога

### Порог срабатывания: 80px

## Расстояние и время

### Формат расстояния:
- < 1 км: отображается в метрах (например, "500 m")
- ≥ 1 км: отображается в километрах (например, "2.5 km")

### Расчет времени в пути:
- Предполагается средняя скорость 30 км/ч в городе
- Отображается в минутах или часах
- Пример: "45 min" или "1h 30min"

## Доступность

### Accessibility Labels:
- `accessibilityRole="button"` - Указывает, что карточка интерактивна
- `accessibilityLabel` - Полное описание заказа для screen readers
- `accessibilityHint` - Подсказки для действий

### Примеры:
- "Order ORD-12345 from John Doe, Washing Machine, 3 500 ₽"
- "Client rating: 4.8"
- "Distance: 2.5 km"
- "Estimated travel time: 5 min"

## Оптимизация производительности

### React.memo
Компонент обернут в `React.memo` с кастомной функцией сравнения:

```tsx
React.memo(OrderCard, (prevProps, nextProps) => {
  return (
    prevProps.orderId === nextProps.orderId &&
    prevProps.status === nextProps.status &&
    prevProps.price === nextProps.price &&
    // ... другие сравнения
  );
});
```

### Оптимизация ре-рендеров:
- Компонент перерендеривается только при изменении релевантных props
- Функции обработчиков не включены в сравнение (стабильные ссылки)
- Избегает ненужных обновлений при изменении нерелевантных данных

## Визуальная структура

```
┌─────────────────────────────────────┐
│ [Avatar] Client Name ⭐ 4.8 [Status] │
│        #ORD-123                     │
├─────────────────────────────────────┤
│ Appliance Type                      │
│ 📍 Address                          │
├─────────────────────────────────────┤
│ [Distance] [Travel Time]    Price   │
│ [🔴 High Priority]                   │
├─────────────────────────────────────┤
│ [Decline]          [Accept]         │
└─────────────────────────────────────┘
```

## Анимации

- **Swipe Animation** - Плавная анимация свайпа с пружиной
- **Priority Indicator** - Пульсирующая точка для высокого приоритета
- **Action Feedback** - Визуальная обратная связь при свайпе

## Кастомизация

Компонент использует Tailwind CSS и может быть легко настроен:
- Цвета статусов
- Стили кнопок
- Размеры и отступы
- Анимации

## Примеры использования

Смотрите `OrderCard.example.tsx` для полных примеров использования компонента в различных сценариях.








