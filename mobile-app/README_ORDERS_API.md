# Orders RTK Query API

Полнофункциональный RTK Query API сервис для управления заказами с поддержкой офлайн-режима и optimistic updates.

## Endpoints

### Queries

#### `getOrders`
Получить список заказов с пагинацией и фильтрами.

```tsx
const { data, isLoading, error, refetch } = useGetOrdersQuery({
  status: 'new',
  filters: {
    minPrice: 1000,
    maxPrice: 5000,
    applianceTypes: ['washing-machine', 'refrigerator'],
    sortBy: 'distance',
    sortOrder: 'asc',
  },
  page: 1,
  pageSize: 20,
  search: 'Samsung',
});
```

**Response:**
```typescript
{
  orders: Order[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}
```

**Features:**
- Автоматическое объединение страниц при пагинации
- Кэширование с тегами для инвалидации
- Поддержка фильтров и поиска

#### `getOrder`
Получить детали одного заказа.

```tsx
const { data, isLoading, error } = useGetOrderQuery(orderId);
```

**Response:** `OrderDetails`

**Features:**
- Кэширование с тегами
- Автоматическое обновление при мутациях

### Mutations

#### `acceptOrder`
Принять заказ.

```tsx
const [acceptOrder, { isLoading, error }] = useAcceptOrderMutation();

await acceptOrder({
  orderId: '123',
  notes: 'Will arrive in 30 minutes',
  scheduledAt: '2024-01-20T10:00:00Z',
}).unwrap();
```

**Features:**
- Optimistic update: статус обновляется сразу
- Автоматическая инвалидация кэша
- Откат при ошибке

#### `updateOrderStatus`
Обновить статус заказа.

```tsx
const [updateStatus, { isLoading }] = useUpdateOrderStatusMutation();

await updateStatus({
  orderId: '123',
  status: 'in_progress',
  notes: 'Work started',
}).unwrap();
```

**Features:**
- Optimistic update
- Поддержка всех статусов
- Автоматическое обновление списка и деталей

#### `addOrderMessage`
Добавить сообщение в чат заказа.

```tsx
const [addMessage, { isLoading }] = useAddOrderMessageMutation();

await addMessage({
  orderId: '123',
  message: 'Hello, I will be there soon',
  attachments: ['image-url-1', 'image-url-2'],
}).unwrap();
```

**Features:**
- Optimistic update: сообщение появляется сразу
- Поддержка вложений
- Автоматическое обновление чата

#### `uploadOrderPhotos`
Загрузить фотографии для заказа.

```tsx
const [uploadPhotos, { isLoading }] = useUploadOrderPhotosMutation();

// Using expo-image-picker
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  allowsMultipleSelection: true,
});

if (!result.canceled) {
  await uploadPhotos({
    orderId: '123',
    photos: result.assets.map((asset) => ({
      uri: asset.uri,
      type: asset.type || 'image/jpeg',
      name: asset.fileName || `photo_${Date.now()}.jpg`,
    })),
  }).unwrap();
}
```

**Features:**
- Загрузка через FormData
- Поддержка множественных файлов
- Optimistic update с превью

#### `declineOrder`
Отклонить заказ.

```tsx
const [declineOrder, { isLoading }] = useDeclineOrderMutation();

await declineOrder({
  orderId: '123',
  reason: 'Too far away',
}).unwrap();
```

## TypeScript Definitions

Все типы определены в `ordersApi.types.ts`:

```typescript
// Request types
GetOrdersRequest
AcceptOrderRequest
UpdateOrderStatusRequest
AddOrderMessageRequest
UploadOrderPhotosRequest
DeclineOrderRequest

// Response types
GetOrdersResponse
AcceptOrderResponse
UpdateOrderStatusResponse
AddOrderMessageResponse
UploadOrderPhotosResponse
DeclineOrderResponse

// Error types
ApiError
NetworkError
```

## Error Handling

### Automatic Error Handling

API автоматически обрабатывает:
- Network errors (offline, timeout)
- HTTP errors (4xx, 5xx)
- Parsing errors

### Using Errors

```tsx
const { data, error, isError } = useGetOrdersQuery({});

if (isError) {
  if (error.status === 'OFFLINE') {
    // Handle offline
  } else {
    // Handle other errors
    console.error(error);
  }
}
```

### Error Helpers

```tsx
import { getErrorMessage, isNetworkError, isApiError } from '../store/api/ordersApi.helpers';

const errorMessage = getErrorMessage(error);

if (isNetworkError(error)) {
  // Handle network error
}

if (isApiError(error)) {
  // Handle API error
}
```

## Cache Invalidation

### Automatic Invalidation

Кэш автоматически инвалидируется при:
- Accept/Decline order → `Order` и `OrderList` теги
- Update status → `Order` и `OrderList` теги
- Add message → `OrderMessages` и `Order` теги
- Upload photos → `Order` тег

### Manual Invalidation

```tsx
import { ordersApi } from '../store/api/ordersApi';

// Invalidate specific order
dispatch(ordersApi.util.invalidateTags([{ type: 'Order', id: '123' }]));

// Invalidate all orders
dispatch(ordersApi.util.invalidateTags([{ type: 'OrderList' }]));

// Invalidate order messages
dispatch(ordersApi.util.invalidateTags([{ type: 'OrderMessages', id: '123' }]));
```

### Cache Tags

- `Order` - Отдельный заказ
- `OrderList` - Список заказов
- `OrderMessages` - Сообщения заказа

## Offline Behavior

### Automatic Detection

API автоматически определяет офлайн-режим через `@react-native-community/netinfo`.

### Offline Response

При офлайн-режиме запросы возвращают:
```typescript
{
  error: {
    status: 'OFFLINE',
    data: { message: 'No internet connection' }
  }
}
```

### Handling Offline

```tsx
const { data, error, isError } = useGetOrdersQuery({});

if (isError && error.status === 'OFFLINE') {
  // Show offline message
  // Load from cache
  // Add to offline queue
}
```

### Offline Queue Integration

Интеграция с `ordersSlice` offline queue:

```tsx
import { addToOfflineQueue } from '../store/slices/ordersSlice';

const [acceptOrder] = useAcceptOrderMutation();

const handleAccept = async (orderId: string) => {
  try {
    await acceptOrder({ orderId }).unwrap();
  } catch (error) {
    if (error.status === 'OFFLINE') {
      // Add to offline queue
      dispatch(addToOfflineQueue({
        type: 'accept',
        payload: { orderId },
      }));
    }
  }
};
```

## Optimistic Updates

Все мутации поддерживают optimistic updates:

### Accept Order

```tsx
// Status immediately changes to 'assigned'
// If request fails, status reverts back
```

### Update Status

```tsx
// Status immediately updates
// CompletedAt set if status is 'completed'
```

### Add Message

```tsx
// Message appears immediately with temp ID
// Replaced with real message when request succeeds
// Removed if request fails
```

### Upload Photos

```tsx
// Photo URIs added immediately
// Replaced with server URLs when upload succeeds
// Removed if upload fails
```

## Usage Examples

### Complete Example

```tsx
import { useGetOrdersQuery, useAcceptOrderMutation } from '../store/api/ordersApi';
import { useAppDispatch } from '../store/hooks';
import { addToOfflineQueue } from '../store/slices/ordersSlice';

const OrdersComponent = () => {
  const dispatch = useAppDispatch();
  
  const { data, isLoading, refetch } = useGetOrdersQuery({
    status: 'new',
    page: 1,
    pageSize: 20,
  });

  const [acceptOrder, { isLoading: isAccepting }] = useAcceptOrderMutation();

  const handleAccept = async (orderId: string) => {
    try {
      await acceptOrder({ orderId }).unwrap();
      // Success - optimistic update already applied
    } catch (error: any) {
      if (error.status === 'OFFLINE') {
        // Add to offline queue
        dispatch(addToOfflineQueue({
          type: 'accept',
          payload: { orderId },
        }));
      } else {
        // Show error message
        Alert.alert('Error', error.message);
      }
    }
  };

  return (
    // Component JSX
  );
};
```

### Pagination Example

```tsx
const OrdersList = () => {
  const [page, setPage] = useState(1);
  
  const { data, isLoading, fetchMore } = useGetOrdersQuery(
    { page, pageSize: 20 },
    {
      // Merge paginated results
      merge: (currentCache, newItems) => ({
        ...newItems,
        orders: [...currentCache.orders, ...newItems.orders],
      }),
    }
  );

  const loadMore = () => {
    if (data?.pagination.hasMore && !isLoading) {
      setPage(page + 1);
    }
  };

  return (
    <FlatList
      data={data?.orders}
      onEndReached={loadMore}
      // ...
    />
  );
};
```

### File Upload Example

```tsx
import * as ImagePicker from 'expo-image-picker';

const PhotoUpload = ({ orderId }: { orderId: string }) => {
  const [uploadPhotos, { isLoading }] = useUploadOrderPhotosMutation();

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      try {
        await uploadPhotos({
          orderId,
          photos: result.assets.map((asset) => ({
            uri: asset.uri,
            type: asset.type || 'image/jpeg',
            name: asset.fileName || `photo_${Date.now()}.jpg`,
          })),
        }).unwrap();
      } catch (error) {
        Alert.alert('Error', 'Failed to upload photos');
      }
    }
  };

  return (
    <TouchableOpacity onPress={pickImages} disabled={isLoading}>
      <Text>Upload Photos</Text>
    </TouchableOpacity>
  );
};
```

## Best Practices

1. **Always handle errors** - Check for offline, network, and API errors
2. **Use optimistic updates** - They're already implemented, just handle errors
3. **Integrate with offline queue** - Add actions to queue when offline
4. **Cache invalidation** - Let RTK Query handle it, use manual invalidation only when needed
5. **Pagination** - Use merge function for seamless pagination
6. **File uploads** - Compress images before uploading for better performance








