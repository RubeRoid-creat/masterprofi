# Redux Toolkit Slices Documentation

Документация для auth и orders Redux slices с полной функциональностью.

## Auth Slice

### State Structure

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  tokenExpiry: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  biometric: BiometricSettings;
  rememberMe: boolean;
}
```

### Actions

#### Synchronous Actions

- `setCredentials` - Установить учетные данные пользователя
- `clearCredentials` - Очистить учетные данные
- `setLoading` - Установить состояние загрузки
- `setInitialized` - Установить состояние инициализации
- `setError` - Установить ошибку
- `updateUser` - Обновить данные пользователя
- `setBiometricEnabled` - Включить/выключить биометрию
- `setBiometricType` - Установить тип биометрии
- `setRememberMe` - Включить/выключить "Запомнить меня"

#### Async Thunks

- `login` - Вход в систему
- `logout` - Выход из системы
- `refreshToken` - Обновление токена доступа
- `checkBiometricSupport` - Проверка поддержки биометрии
- `authenticateWithBiometric` - Аутентификация по биометрии
- `loadPersistedAuth` - Загрузка сохраненных данных аутентификации

### Usage Examples

#### Login

```tsx
import { useAppDispatch } from '../store/hooks';
import { login } from '../store/slices/authSlice';

const LoginComponent = () => {
  const dispatch = useAppDispatch();

  const handleLogin = async () => {
    try {
      await dispatch(login({
        emailOrPhone: 'user@example.com',
        password: 'password123',
        rememberMe: true,
      })).unwrap();
      // Navigation will happen automatically via auth state
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
};
```

#### Biometric Authentication

```tsx
import { checkBiometricSupport, authenticateWithBiometric } from '../store/slices/authSlice';

// Check support
const result = await dispatch(checkBiometricSupport()).unwrap();
if (result.compatible && result.enrolled) {
  // Authenticate
  await dispatch(authenticateWithBiometric()).unwrap();
}
```

#### Token Refresh

```tsx
import { refreshToken } from '../store/slices/authSlice';

// Automatically refresh token when expired
const result = await dispatch(refreshToken()).unwrap();
```

## Orders Slice

### State Structure

```typescript
interface OrdersState {
  orders: Order[];
  filteredOrders: Order[];
  activeOrder: Order | null;
  activeTab: OrderStatus;
  searchQuery: string;
  filters: OrderFilters;
  showMap: boolean;
  isRefreshing: boolean;
  newOrdersCount: number;
  lastSyncTime: string | null;
  pagination: PaginationState;
  chatMessages: Record<string, ChatMessage[]>;
  offlineQueue: OfflineAction[];
  isOffline: boolean;
  isSyncing: boolean;
  syncError: string | null;
}
```

### Actions

#### Order Management

- `setOrders` - Установить список заказов
- `addOrders` - Добавить заказы (для пагинации)
- `updateOrder` - Обновить заказ
- `removeOrder` - Удалить заказ
- `setActiveOrder` - Установить активный заказ
- `updateOrderStatus` - Обновить статус заказа

#### Filters & Search

- `setActiveTab` - Установить активную вкладку (new, assigned, etc.)
- `setSearchQuery` - Установить поисковый запрос
- `setFilters` - Установить фильтры
- `toggleMapView` - Переключить вид карты

#### Pagination

- `setPage` - Установить текущую страницу
- `setPageSize` - Установить размер страницы
- `setPaginationTotal` - Установить общее количество
- `setLoadingMore` - Установить состояние загрузки
- `incrementPage` - Увеличить номер страницы

#### Chat Messages

- `addChatMessage` - Добавить сообщение в чат
- `setChatMessages` - Установить список сообщений
- `clearChatMessages` - Очистить сообщения для заказа

#### Offline Queue

- `addToOfflineQueue` - Добавить действие в очередь
- `removeFromOfflineQueue` - Удалить действие из очереди
- `incrementRetryCount` - Увеличить счетчик повторов
- `clearOfflineQueue` - Очистить очередь

#### Real-time Sync

- `setIsOffline` - Установить статус офлайн
- `setSyncing` - Установить состояние синхронизации
- `setSyncError` - Установить ошибку синхронизации

#### Async Thunks

- `syncOfflineActions` - Синхронизировать действия из офлайн очереди
- `loadCachedOrders` - Загрузить кэшированные заказы
- `cacheOrders` - Сохранить заказы в кэш

### Usage Examples

#### Load Orders with Pagination

```tsx
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setOrders, incrementPage, setLoadingMore } from '../store/slices/ordersSlice';

const OrdersComponent = () => {
  const dispatch = useAppDispatch();
  const { orders, pagination } = useAppSelector((state) => state.orders);

  const loadMore = async () => {
    if (!pagination.hasMore || pagination.isLoadingMore) return;

    dispatch(setLoadingMore(true));
    try {
      const response = await fetch(`/api/orders?page=${pagination.page + 1}`);
      const newOrders = await response.json();
      
      dispatch(addOrders(newOrders));
      dispatch(incrementPage());
      dispatch(setPaginationTotal(response.headers.get('X-Total-Count')));
    } finally {
      dispatch(setLoadingMore(false));
    }
  };
};
```

#### Offline Queue

```tsx
import { addToOfflineQueue, syncOfflineActions } from '../store/slices/ordersSlice';

// Add action to offline queue
dispatch(addToOfflineQueue({
  type: 'accept',
  payload: { orderId: '123' },
}));

// Sync when online
if (!isOffline) {
  await dispatch(syncOfflineActions()).unwrap();
}
```

#### Update Order Status

```tsx
import { updateOrderStatus, addToOfflineQueue } from '../store/slices/ordersSlice';

const updateStatus = (orderId: string, status: OrderStatus) => {
  // Update locally immediately
  dispatch(updateOrderStatus({ orderId, status }));

  // Add to offline queue if offline
  if (isOffline) {
    dispatch(addToOfflineQueue({
      type: 'updateStatus',
      payload: { orderId, status },
    }));
  } else {
    // Make API call
    fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }
};
```

#### Chat Messages

```tsx
import { addChatMessage, setChatMessages } from '../store/slices/ordersSlice';

// Add single message
dispatch(addChatMessage({
  orderId: '123',
  message: {
    id: 'msg1',
    senderId: 'user1',
    message: 'Hello',
    timestamp: new Date().toISOString(),
  },
}));

// Set all messages for order
dispatch(setChatMessages({
  orderId: '123',
  messages: [...],
}));
```

## Persistence

### Configuration

Автоматическое сохранение состояния при изменении:

```typescript
// Auth state persists on:
- setCredentials
- logout
- updateUser
- setBiometricEnabled

// Orders state persists on:
- setOrders
- updateOrder
- setActiveOrder
- addChatMessage
- addToOfflineQueue
```

### Manual Persistence

```tsx
import { persistAuthState, persistOrdersState } from '../store/persistence';

// Save manually
const state = store.getState();
await persistAuthState(state.auth);
await persistOrdersState(state.orders);
```

## RTK Query Integration

### Auth API

```tsx
import { useLoginMutation, useGetCurrentUserQuery } from '../store/api/authApi';

const LoginComponent = () => {
  const [login, { isLoading, error }] = useLoginMutation();

  const handleLogin = async () => {
    try {
      const result = await login({
        emailOrPhone: 'user@example.com',
        password: 'password',
      }).unwrap();
      
      // Dispatch to auth slice
      dispatch(setCredentials(result));
    } catch (error) {
      console.error(error);
    }
  };
};
```

### Orders API

```tsx
import { useGetOrdersQuery } from '../store/api/ordersApi';

const OrdersComponent = () => {
  const { data, isLoading, refetch } = useGetOrdersQuery({
    status: 'new',
    page: 1,
  });

  useEffect(() => {
    if (data) {
      dispatch(setOrders(data));
      dispatch(cacheOrders(data));
    }
  }, [data]);
};
```

## Best Practices

1. **Always use actions, not direct state mutation**
2. **Use async thunks for API calls**
3. **Add offline actions to queue when offline**
4. **Sync offline queue when connection restored**
5. **Cache data for offline access**
6. **Use pagination for large lists**
7. **Update local state immediately, sync with server async**








