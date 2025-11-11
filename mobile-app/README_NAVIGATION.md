# React Navigation Setup

Полная настройка React Navigation с type-safe navigation, защищенными маршрутами, persistence и deep linking.

## Структура навигации

```
RootNavigator
├── Auth (unauthenticated)
│   └── AuthNavigator
│       ├── Login
│       └── Registration
│
└── Main (authenticated)
    ├── MainTabNavigator
    │   ├── OrdersTab
    │   │   ├── OrderFeed
    │   │   ├── OrderDetails
    │   │   └── OrderChat
    │   ├── NetworkTab
    │   │   ├── MLMDashboard
    │   │   ├── MLMMemberDetails
    │   │   └── MLMInvite
    │   ├── EarningsTab
    │   │   ├── EarningsHome
    │   │   ├── EarningsDetails
    │   │   ├── WithdrawalRequest
    │   │   └── PaymentMethods
    │   └── ProfileTab
    │       ├── ProfileHome
    │       ├── ProfileEdit
    │       ├── Settings
    │       ├── KnowledgeBase
    │       └── Certificates
    │
    └── Modals
        ├── OrderDetailsModal
        ├── ChatModal
        ├── RepairCalculatorModal
        ├── SignatureModal
        └── PDFViewerModal
```

## Функциональность

✅ **Bottom Tab Navigator**
- Orders, Network, Earnings, Profile
- Иконки для каждой вкладки
- Кастомный стиль tab bar

✅ **Stack Navigator для каждой вкладки**
- Собственный стек навигации
- Заголовки с цветами вкладок
- Навигация назад

✅ **Authentication Stack**
- Login и Registration экраны
- Защищенные маршруты
- Автоматическое переключение на основе auth state

✅ **Modal Screens**
- Модальные экраны для деталей
- Slide from bottom анимация
- Независимые от основных стеков

✅ **Deep Linking Support**
- URL схема: `masterprofi://`
- Поддержка HTTPS ссылок
- Конфигурация для всех экранов
- Обработка initial URL

✅ **Protected Routes**
- Проверка auth state
- Автоматическая переадресация
- Сохранение navigation state после logout

✅ **Navigation Persistence**
- Сохранение состояния навигации в AsyncStorage
- Восстановление при перезапуске
- Очистка при logout

✅ **Type-safe Navigation с TypeScript**
- Полная типизация всех навигационных экранов
- Автодополнение в IDE
- Проверка типов параметров

## Использование

### Навигация в компонентах

```tsx
import { useNavigation } from '@react-navigation/native';
import { useTypedNavigation } from '../navigation';

// В компоненте
const navigation = useNavigation();
const typedNav = useTypedNavigation();

// Navigate to screen
navigation.navigate('Main', {
  screen: 'OrdersTab',
  params: {
    screen: 'OrderDetails',
    params: { orderId: '123' },
  },
});

// Or using typed navigation
typedNav.navigate('Main', {
  screen: 'OrdersTab',
  params: {
    screen: 'OrderDetails',
    params: { orderId: '123' },
  },
});
```

### Навигация из вне компонента

```tsx
import { navigate } from '../navigation';

// Navigate
navigate('Main', {
  screen: 'OrdersTab',
  params: {
    screen: 'OrderDetails',
    params: { orderId: '123' },
  },
});

// Go back
import { goBack } from '../navigation';
goBack();
```

### Открытие модальных экранов

```tsx
navigation.navigate('Modals', {
  screen: 'OrderDetailsModal',
  params: { orderId: '123' },
});
```

### Deep Linking

```tsx
// Открыть заказ по ID
Linking.openURL('masterprofi://orders/123');

// Открыть профиль участника сети
Linking.openURL('masterprofi://network/member/456');

// Открыть модальный калькулятор
Linking.openURL('masterprofi://modal/calculator/789');
```

## Типы навигации

Все типы определены в `navigation/types.ts`:

```typescript
type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Modals: NavigatorScreenParams<ModalStackParamList>;
};
```

## Protected Routes

Маршруты автоматически защищены через проверку `isAuthenticated` в Redux store:

```tsx
{isAuthenticated ? (
  <>
    <Stack.Screen name="Main" component={MainTabNavigator} />
    <Stack.Screen name="Modals" component={ModalNavigator} />
  </>
) : (
  <Stack.Screen name="Auth" component={AuthNavigator} />
)}
```

## Persistence

Состояние навигации автоматически сохраняется в AsyncStorage и восстанавливается при перезапуске приложения.

Очистка при logout:

```tsx
import { clearNavigationState } from '../navigation/persistence';
import { logout } from '../store/slices/authSlice';

const handleLogout = () => {
  dispatch(logout());
  clearNavigationState();
  // Navigation will automatically redirect to Auth stack
};
```

## Deep Linking URLs

### Orders
- `masterprofi://orders` - Список заказов
- `masterprofi://orders/123` - Детали заказа

### Network
- `masterprofi://network` - MLM Dashboard
- `masterprofi://network/member/456` - Детали участника

### Earnings
- `masterprofi://earnings` - Главная страница доходов
- `masterprofi://earnings/789` - Детали транзакции

### Profile
- `masterprofi://profile` - Профиль
- `masterprofi://profile/settings` - Настройки

### Modals
- `masterprofi://modal/orders/123` - Модальное окно заказа
- `masterprofi://modal/chat/456` - Модальное окно чата

## Настройка Android

Добавьте в `android/app/src/main/AndroidManifest.xml`:

```xml
<activity
  android:name=".MainActivity"
  android:launchMode="singleTask">
  <intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="masterprofi" />
  </intent-filter>
</activity>
```

## Настройка iOS

Добавьте в `ios/[ProjectName]/Info.plist`:

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>masterprofi</string>
    </array>
  </dict>
</array>
```

## Зависимости

```json
{
  "@react-navigation/native": "^6.1.9",
  "@react-navigation/bottom-tabs": "^6.5.11",
  "@react-navigation/native-stack": "^6.9.17",
  "react-native-screens": "~3.29.0",
  "react-native-safe-area-context": "4.8.2",
  "react-native-gesture-handler": "~2.14.0",
  "@react-native-async-storage/async-storage": "1.21.0"
}
```

## Замена иконок

Текущие иконки - эмодзи-заглушки. Для продакшена установите:

```bash
npm install @expo/vector-icons
# или
npm install react-native-vector-icons
```

И обновите `MainTabNavigator.tsx`:

```tsx
import { Ionicons } from '@expo/vector-icons';

<Tab.Screen
  name="OrdersTab"
  options={{
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="list" size={size} color={color} />
    ),
  }}
/>
```

## Проверка типов

Все параметры навигации проверяются TypeScript на этапе компиляции:

```tsx
// ✅ Правильно
navigation.navigate('Main', {
  screen: 'OrdersTab',
  params: {
    screen: 'OrderDetails',
    params: { orderId: '123' },
  },
});

// ❌ Ошибка типов
navigation.navigate('Main', {
  screen: 'OrdersTab',
  params: {
    screen: 'OrderDetails',
    params: { wrongParam: '123' }, // Error!
  },
});
```








