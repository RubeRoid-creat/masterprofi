# Order Feed Screen

Экран ленты заказов для мастеров сервиса с поддержкой реального времени, офлайн режима и всех современных функций.

## Особенности

✅ **Pull-to-Refresh** - Обновление списка заказов  
✅ **Tab Filters** - Фильтры по статусам (New, Assigned, In Progress, Completed)  
✅ **Order Cards** - Карточки заказов с полной информацией  
✅ **Map View Toggle** - Переключение между списком и картой  
✅ **Search & Filter** - Поиск и расширенные фильтры  
✅ **Real-time Updates** - Обновления через WebSocket  
✅ **Offline Cache** - Кэширование заказов для офлайн режима  
✅ **Badge Count** - Бейдж с количеством новых заказов  

## Архитектура

### Redux Store
- **ordersSlice** - Управление состоянием заказов
- **ordersApi** - RTK Query для API запросов
- Автоматическая синхронизация каждые 15 минут

### WebSocket
- Подключение для получения обновлений в реальном времени
- Автоматическое переподключение при обрыве связи
- Обработка событий: order_update, new_order, order_removed

### Offline Support
- Кэширование в AsyncStorage
- Автоматическое использование кэша в офлайн режиме
- Синхронизация при восстановлении соединения

## Компоненты

### OrderFeedScreen
Главный компонент экрана с управлением состоянием и навигацией.

### OrderCard
Карточка заказа с информацией:
- Данные клиента (имя, телефон, аватар)
- Тип прибора и проблема
- Адрес и расстояние
- Цена
- Статус с цветовой индикацией
- Кнопка "Accept" для новых заказов
- Бейдж для новых заказов

### OrderTabs
Табы для фильтрации по статусам с бейджами для новых заказов.

### OrderMapView
Карта с маркерами заказов (требует настройки react-native-maps).

### OrderFiltersComponent
Модальное окно с фильтрами:
- Диапазон цен
- Максимальное расстояние
- Типы приборов
- Сортировка

## Использование

```tsx
import { OrderFeedScreen } from './src/screens/OrderFeedScreen';
import { Provider } from 'react-redux';
import { store } from './src/store/store';

function App() {
  const handleOrderPress = (order: Order) => {
    // Navigate to order details
    navigation.navigate('OrderDetails', { orderId: order.id });
  };

  return (
    <Provider store={store}>
      <OrderFeedScreen onOrderPress={handleOrderPress} />
    </Provider>
  );
}
```

## API Integration

### RTK Query Endpoints
- `getOrders` - Получение списка заказов с фильтрацией
- `getOrderById` - Получение деталей заказа
- `updateOrderStatus` - Обновление статуса заказа
- `acceptOrder` - Принятие заказа мастером

### WebSocket Events
Подключение к WebSocket endpoint для получения обновлений:
- `order_update` - Обновление существующего заказа
- `new_order` - Новый заказ появился
- `order_removed` - Заказ удален

## Настройка

### 1. Обновите API URL
В `src/store/api/ordersApi.ts`:
```typescript
const API_BASE_URL = 'https://your-api.com/api';
```

### 2. Настройте WebSocket URL
В `src/screens/OrderFeedScreen.tsx`:
```typescript
url: 'wss://your-api.com/api/orders/stream'
```

### 3. Настройте карту (опционально)
После установки react-native-maps раскомментируйте код в `OrderMapView.tsx`.

## Зависимости

```bash
npm install @reduxjs/toolkit react-redux @react-native-async-storage/async-storage @react-native-community/netinfo
```

## Функции

### Pull-to-Refresh
- Обновление списка при свайпе вниз
- Индикатор загрузки
- Автоматическая синхронизация каждые 15 минут

### Фильтрация
- Поиск по имени клиента, типу прибора, адресу
- Фильтры по цене, расстоянию, типу прибора
- Сортировка по расстоянию, цене, дате

### Real-time Updates
- WebSocket для мгновенных обновлений
- Автоматическое переподключение
- Обновление без перезагрузки страницы

### Offline Mode
- Кэширование заказов в AsyncStorage
- Автоматическое использование кэша
- Индикатор офлайн режима

### Badge Count
- Отображение количества новых заказов
- Автоматическое обновление при получении новых заказов
- Сброс при просмотре заказа

## Типы данных

```typescript
interface Order {
  id: string;
  client: { name: string; phone: string; avatar?: string };
  appliance: { type: string; brand?: string; model?: string; issue?: string };
  location: { address: string; latitude: number; longitude: number; distance?: number };
  price: { amount: number; currency: string };
  status: OrderStatus;
  createdAt: string;
  isNew?: boolean;
}
```

## Производительность

- Виртуализация списка через FlatList
- Оптимизированная фильтрация
- Ленивая загрузка данных
- Кэширование для быстрого доступа









