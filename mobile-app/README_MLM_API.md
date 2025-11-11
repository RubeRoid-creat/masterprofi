# MLM RTK Query API

Полнофункциональный RTK Query API сервис для MLM (Multi-Level Marketing) системы с поддержкой иерархии сети, комиссий, статистики команды и рекрутинга.

## Endpoints

### Queries

#### `getNetworkStructure`
Получить иерархию MLM сети с детальной информацией о членах команды.

```tsx
const { data, isLoading, error } = useGetNetworkStructureQuery({
  memberId: 'user-123', // Optional: specific member, default: current user
  maxDepth: 5, // Maximum depth of hierarchy (default: 5)
  includeStats: true, // Include statistics (default: true)
});
```

**Response:**
```typescript
{
  member: MLMMember;
  totalMembers: number;
  totalDownline: number;
  stats?: NetworkStats;
}
```

**Features:**
- Автоматический polling каждые 5 минут для real-time обновлений
- Кэширование с тегами
- Поддержка ограничения глубины иерархии

#### `getCommissions`
Получить комиссии и заработки по периодам и уровням.

```tsx
const { data, isLoading } = useGetCommissionsQuery({
  period: 'month', // 'day' | 'week' | 'month' | 'year' | 'all'
  startDate: '2024-01-01', // Optional
  endDate: '2024-01-31', // Optional
  level: 1, // Optional: specific level
});
```

**Response:**
```typescript
{
  commissions: CommissionLevel[];
  total: number;
  period: string;
  breakdown: Array<{
    level: number;
    sales: number;
    commission: number;
    percentage: number;
  }>;
  summary: {
    personalCommissions: number;
    teamCommissions: number;
    totalCommissions: number;
    pendingCommissions: number;
  };
}
```

**Features:**
- Детальная разбивка по уровням
- Сводка комиссий (личные, командные, ожидающие)
- Кэширование на 2 минуты

#### `getTeamStats`
Получить статистику команды с производительностью.

```tsx
const { data, isLoading } = useGetTeamStatsQuery({
  period: 'month', // 'day' | 'week' | 'month' | 'quarter' | 'year'
  memberId: 'user-123', // Optional: specific member's team
});
```

**Response:**
```typescript
{
  stats: NetworkStats;
  commissionByLevel: CommissionLevel[];
  growthData: Array<{
    date: string;
    members: number;
    sales: number;
  }>;
  topPerformers: Array<{
    memberId: string;
    memberName: string;
    sales: number;
    referrals: number;
  }>;
}
```

**Features:**
- Статистика команды
- Комиссии по уровням
- Данные роста
- Топ-исполнители

#### `getBonusHistory`
Получить историю бонусных выплат.

```tsx
const { data, isLoading } = useGetBonusHistoryQuery({
  period: 'year', // 'month' | 'quarter' | 'year' | 'all'
  startDate: '2024-01-01', // Optional
  endDate: '2024-12-31', // Optional
});
```

**Response:**
```typescript
{
  bonuses: MonthlyBonus[];
  totalBonuses: number;
  period: string;
  nextBonus?: {
    target: number;
    reward: number;
    deadline: string;
    progress: number;
  };
}
```

**Features:**
- История всех бонусов
- Информация о следующем бонусе
- Кэширование на 5 минут

#### `getLeaderboard`
Получить рейтинг участников сети.

```tsx
const { data, isLoading } = useGetLeaderboardQuery({
  metric: 'earnings', // 'sales' | 'referrals' | 'earnings' | 'teamSize'
  period: 'month', // 'day' | 'week' | 'month' | 'year' | 'all'
  limit: 100, // Number of entries (default: 100)
});
```

**Response:**
```typescript
{
  entries: LeaderboardEntry[];
  currentUserRank?: number;
  period: string;
  metric: string;
}
```

**Features:**
- Различные метрики рейтинга
- Позиция текущего пользователя
- Кэширование на 10 минут

#### `getMyReferralCode`
Получить реферальный код текущего пользователя.

```tsx
const { data, isLoading } = useGetMyReferralCodeQuery();
```

**Response:** `InviteData`

**Features:**
- Реферальный код и ссылка
- QR-код для быстрого приглашения

#### `getCommissionByLevel`
Получить детали комиссии для конкретного уровня.

```tsx
const { data, isLoading } = useGetCommissionByLevelQuery(1); // Level 1
```

### Mutations

#### `inviteUser`
Пригласить нового пользователя в сеть.

```tsx
const [inviteUser, { isLoading, error }] = useInviteUserMutation();

await inviteUser({
  email: 'newuser@example.com',
  phone: '+7 (999) 123-45-67',
  name: 'John Doe',
  message: 'Join our team!',
}).unwrap();
```

**Features:**
- Optimistic update
- Автоматическая инвалидация сети и статистики
- Откат при ошибке

## TypeScript Definitions

Все типы определены в `mlmApi.types.ts`:

```typescript
// Request types
GetNetworkStructureRequest
GetCommissionsRequest
GetTeamStatsRequest
InviteUserRequest
GetBonusHistoryRequest
GetLeaderboardRequest

// Response types
GetNetworkStructureResponse
GetCommissionsResponse
GetTeamStatsResponse
InviteUserResponse
GetBonusHistoryResponse
GetLeaderboardResponse

// Error types
MLMApiError
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
const { data, error, isError } = useGetNetworkStructureQuery({});

if (isError) {
  if (error.status === 'OFFLINE') {
    // Handle offline
  } else {
    console.error(error);
  }
}
```

### Error Helpers

```tsx
import { getMLMErrorMessage, isMLMNetworkError } from '../store/api/mlmApi.helpers';

const errorMessage = getMLMErrorMessage(error);

if (isMLMNetworkError(error)) {
  // Handle network error
}
```

## Cache Invalidation

### Automatic Invalidation

Кэш автоматически инвалидируется при:
- `inviteUser` → `Network`, `TeamStats`, `Invite` теги

### Manual Invalidation

```tsx
import { mlmApi } from '../store/api/mlmApi';

// Invalidate network
dispatch(mlmApi.util.invalidateTags([{ type: 'Network', id: 'root' }]));

// Invalidate all commissions
dispatch(mlmApi.util.invalidateTags([{ type: 'Commissions' }]));

// Invalidate team stats
dispatch(mlmApi.util.invalidateTags([{ type: 'TeamStats' }]));
```

### Cache Tags

- `Network` - Иерархия сети (с ID участника)
- `Commissions` - Комиссии
- `TeamStats` - Статистика команды
- `Leaderboard` - Рейтинг
- `BonusHistory` - История бонусов
- `Invite` - Приглашения

## Offline Behavior

API автоматически определяет офлайн-режим и возвращает соответствующие ошибки.

```tsx
if (isError && error.status === 'OFFLINE') {
  // Show offline message
  // Load from cache if available
}
```

## Polling

`getNetworkStructure` автоматически обновляется каждые 5 минут:

```tsx
// Automatic polling every 5 minutes
const { data } = useGetNetworkStructureQuery({});
```

## Usage Examples

### Complete Network Dashboard

```tsx
import {
  useGetNetworkStructureQuery,
  useGetTeamStatsQuery,
  useGetCommissionsQuery,
  useGetLeaderboardQuery,
} from '../store/api/mlmApi';

const MLMDashboard = () => {
  const { data: network, isLoading: networkLoading } = useGetNetworkStructureQuery({
    maxDepth: 5,
    includeStats: true,
  });

  const { data: stats, isLoading: statsLoading } = useGetTeamStatsQuery({
    period: 'month',
  });

  const { data: commissions, isLoading: commissionsLoading } = useGetCommissionsQuery({
    period: 'month',
  });

  const { data: leaderboard } = useGetLeaderboardQuery({
    metric: 'earnings',
    period: 'month',
    limit: 50,
  });

  return (
    // Dashboard JSX
  );
};
```

### Invite User with Error Handling

```tsx
import { useInviteUserMutation } from '../store/api/mlmApi';
import { getMLMErrorMessage } from '../store/api/mlmApi.helpers';

const InviteComponent = () => {
  const [inviteUser, { isLoading, error }] = useInviteUserMutation();

  const handleInvite = async (email: string, name: string) => {
    try {
      const result = await inviteUser({
        email,
        name,
        message: 'Join our team and start earning!',
      }).unwrap();
      
      Alert.alert('Success', `Invite sent to ${result.invite.link}`);
    } catch (error) {
      Alert.alert('Error', getMLMErrorMessage(error));
    }
  };

  return (
    // Invite form JSX
  );
};
```

### Commissions with Period Filter

```tsx
const CommissionsComponent = () => {
  const [period, setPeriod] = useState<'month' | 'year' | 'all'>('month');
  
  const { data, isLoading } = useGetCommissionsQuery({ period });

  return (
    <View>
      <Picker selectedValue={period} onValueChange={setPeriod}>
        <Picker.Item label="Month" value="month" />
        <Picker.Item label="Year" value="year" />
        <Picker.Item label="All Time" value="all" />
      </Picker>
      
      {data && (
        <View>
          <Text>Total: {formatCommission(data.total)}</Text>
          <Text>Personal: {formatCommission(data.summary.personalCommissions)}</Text>
          <Text>Team: {formatCommission(data.summary.teamCommissions)}</Text>
        </View>
      )}
    </View>
  );
};
```

### Leaderboard with Multiple Metrics

```tsx
const LeaderboardComponent = () => {
  const [metric, setMetric] = useState<'earnings' | 'sales' | 'referrals'>('earnings');
  
  const { data, isLoading } = useGetLeaderboardQuery({
    metric,
    period: 'month',
    limit: 100,
  });

  return (
    <View>
      <SegmentedControl
        values={['earnings', 'sales', 'referrals']}
        selectedIndex={metric === 'earnings' ? 0 : metric === 'sales' ? 1 : 2}
        onChange={(e) => setMetric(e.nativeEvent.selectedSegmentIndex === 0 ? 'earnings' : e.nativeEvent.selectedSegmentIndex === 1 ? 'sales' : 'referrals')}
      />
      
      <FlatList
        data={data?.entries}
        renderItem={({ item }) => (
          <LeaderboardItem entry={item} currentRank={data?.currentUserRank} />
        )}
      />
    </View>
  );
};
```

## Helper Functions

```tsx
import {
  getCommissionPercentage,
  formatCommission,
  calculateRank,
  formatPeriod,
} from '../store/api/mlmApi.helpers';

// Get commission rate for level
const rate = getCommissionPercentage(1); // 3.0%

// Format commission amount
const formatted = formatCommission(15000); // "15 000 ₽"

// Calculate rank from earnings
const rank = calculateRank(250000); // "Gold"

// Format period
const periodText = formatPeriod('month'); // "Month"
```

## Best Practices

1. **Use lazy queries for conditional loading** - `useLazyGetNetworkStructureQuery()`
2. **Leverage polling for real-time data** - Network structure polls automatically
3. **Cache invalidation** - Let RTK Query handle it, invalidate manually when needed
4. **Error handling** - Always check for offline errors and show appropriate messages
5. **Period selection** - Allow users to switch between periods for better UX
6. **Loading states** - Show loading indicators during data fetching








