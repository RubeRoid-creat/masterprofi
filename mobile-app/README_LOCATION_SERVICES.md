# Location Services Integration

Полная интеграция сервисов геолокации с поддержкой отслеживания, навигации, проверки границ зоны обслуживания и офлайн-карт.

## Возможности

✅ **Current Location Tracking**
- Отслеживание текущего местоположения
- Автоматическое обновление
- Поддержка различных уровней точности

✅ **Directions to Client Address**
- Интеграция с Google Maps / Apple Maps
- Навигация по координатам или адресу
- Различные режимы (driving, walking, transit)

✅ **Service Area Boundary Checking**
- Проверка нахождения в зоне обслуживания
- Geofencing с уведомлениями о входе/выходе
- Мониторинг в реальном времени

✅ **Travel Time Estimation**
- Расчет времени в пути
- Учет режима передвижения
- Форматированный вывод

✅ **Offline Maps Support**
- Кэширование местоположений
- Работа без интернета (базовые функции)
- Офлайн расчет расстояний

✅ **Background Location Updates**
- Отслеживание в фоновом режиме
- Уведомления о местоположении
- Оптимизированное потребление батареи

✅ **Permissions Handling**
- Автоматический запрос разрешений
- Объяснение необходимости доступа
- Открытие настроек при отказе

## Использование

### Current Location Tracking

```tsx
import { useLocation } from '../hooks/useLocation';

const MyComponent = () => {
  const {
    location,
    isLoading,
    error,
    getCurrentLocation,
    startWatching,
    stopWatching,
    isWatching,
  } = useLocation({
    autoStart: true,
    updateInterval: 5000, // 5 seconds
  });

  return (
    <View>
      {location && (
        <Text>
          Lat: {location.latitude}, Lng: {location.longitude}
        </Text>
      )}
      <Button onPress={startWatching} title="Start Tracking" />
      <Button onPress={stopWatching} title="Stop Tracking" />
    </View>
  );
};
```

### Navigation to Address

```tsx
import { navigationService } from '../services/navigationService';

// Open navigation
await navigationService.openNavigation({
  destination: { latitude: 55.7558, longitude: 37.6173 },
  mode: 'driving',
});

// Or with address string
await navigationService.openNavigation({
  destination: 'Moscow, Red Square',
  mode: 'walking',
});

// Get navigation info without opening
const info = await navigationService.getNavigationInfo(
  { latitude: 55.7558, longitude: 37.6173 },
  'driving'
);
// info.distance, info.estimatedTime, info.formattedTime
```

### Service Area Checking

```tsx
import { useServiceArea } from '../hooks/useServiceArea';

const ServiceAreaComponent = () => {
  const serviceArea = {
    center: { latitude: 55.7558, longitude: 37.6173 },
    radius: 10, // 10 km
  };

  const {
    isWithinArea,
    distance,
    startMonitoring,
    stopMonitoring,
    checkNow,
  } = useServiceArea({
    serviceArea,
    autoCheck: true,
    onEnter: (event) => {
      console.log('Entered service area');
    },
    onExit: (event) => {
      console.log('Exited service area');
    },
  });

  return (
    <View>
      {isWithinArea !== null && (
        <Text>
          {isWithinArea ? 'Within service area' : 'Outside service area'}
          {distance !== null && ` (${distance.toFixed(1)} km away)`}
        </Text>
      )}
    </View>
  );
};
```

### Background Location

```tsx
import { useBackgroundLocation } from '../hooks/useBackgroundLocation';

const BackgroundTracking = () => {
  const {
    isEnabled,
    enable,
    disable,
    lastLocation,
    isLoading,
    error,
  } = useBackgroundLocation({
    autoStart: false,
    onLocationUpdate: (location) => {
      // Send to server, update state, etc.
      console.log('Background location update:', location);
    },
  });

  return (
    <View>
      <Button
        onPress={enable}
        title={isEnabled ? 'Background Tracking Active' : 'Enable Background Tracking'}
        disabled={isLoading}
      />
      {lastLocation && (
        <Text>
          Last: {lastLocation.latitude}, {lastLocation.longitude}
        </Text>
      )}
    </View>
  );
};
```

### Permissions Handling

```tsx
import {
  requestForegroundLocationPermission,
  requestBackgroundLocationPermission,
  showPermissionRationale,
  openAppSettings,
} from '../utils/permissions';

// Request foreground permission
const result = await requestForegroundLocationPermission();
if (result.status !== 'granted') {
  if (result.needsRationale) {
    showPermissionRationale();
  }
}

// Request background permission
const bgResult = await requestBackgroundLocationPermission();
if (bgResult.status !== 'granted') {
  // Show explanation and open settings
  showPermissionRationale(
    'Background Location Required',
    'We need background access to track your position while providing services.'
  );
  openAppSettings();
}
```

## Components

### CurrentLocationButton

```tsx
import { CurrentLocationButton } from '../components/location/CurrentLocationButton';

<CurrentLocationButton
  onLocationUpdate={(lat, lng) => {
    console.log('Location updated:', lat, lng);
  }}
/>
```

### NavigationButton

```tsx
import { NavigationButton } from '../components/location/NavigationButton';

<NavigationButton
  destination={{ latitude: 55.7558, longitude: 37.6173 }}
  mode="driving"
  showInfo={true}
/>
```

## Services

### LocationService

```tsx
import { locationService } from '../services/locationService';

// Get current location
const location = await locationService.getCurrentLocation();

// Start watching
await locationService.startWatchingLocation((location) => {
  console.log('Location update:', location);
});

// Stop watching
locationService.stopWatchingLocation();

// Get last known location
const lastLocation = locationService.getLastKnownLocation();
```

### NavigationService

```tsx
import { navigationService } from '../services/navigationService';

// Open navigation
await navigationService.openNavigation({
  destination: coordinates,
  mode: 'driving',
});

// Get navigation info
const info = await navigationService.getNavigationInfo(
  coordinates,
  'driving'
);
```

### GeofencingService

```tsx
import { geofencingService } from '../services/geofencingService';

// Add monitor
geofencingService.addMonitor(
  'monitor-1',
  {
    center: { latitude: 55.7558, longitude: 37.6173 },
    radius: 10,
  },
  {
    onEnter: (event) => console.log('Entered area'),
    onExit: (event) => console.log('Exited area'),
  }
);

// Remove monitor
geofencingService.removeMonitor('monitor-1');
```

## Helpers

### Location Helpers

```tsx
import {
  calculateDistance,
  isWithinServiceArea,
  estimateTravelTime,
  formatTravelTime,
  formatDistance,
} from '../utils/locationHelpers';

// Calculate distance
const distance = calculateDistance(coord1, coord2); // km

// Check if within service area
const within = isWithinServiceArea(coordinates, serviceArea);

// Estimate travel time
const time = estimateTravelTime(distance, 30); // minutes

// Format
const formatted = formatTravelTime(time); // "45 min"
const distFormatted = formatDistance(distance); // "5.2 km"
```

## Настройка Background Location

Для работы фонового отслеживания добавьте в `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow $(PRODUCT_NAME) to use your location even when the app is in the background."
        }
      ]
    ],
    "ios": {
      "infoPlist": {
        "UIBackgroundModes": ["location"]
      }
    },
    "android": {
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "ACCESS_BACKGROUND_LOCATION"
      ]
    }
  }
}
```

## Offline Support

### Cached Locations

Сервис автоматически кэширует последнее известное местоположение:

```tsx
const lastLocation = locationService.getLastKnownLocation();
if (lastLocation) {
  // Use cached location when offline
}
```

### Distance Calculations

Расчет расстояний работает офлайн (Haversine formula):

```tsx
// Works offline
const distance = calculateDistance(coord1, coord2);
const within = isWithinServiceArea(coordinates, serviceArea);
```

## Best Practices

1. **Request permissions early** - Запрашивайте разрешения при первом использовании
2. **Show rationale** - Объясняйте необходимость доступа
3. **Handle errors gracefully** - Обрабатывайте ошибки разрешений
4. **Use appropriate accuracy** - Используйте низкую точность для экономии батареи
5. **Stop tracking when not needed** - Останавливайте отслеживание когда не используется
6. **Respect user privacy** - Не собирайте данные без необходимости

## Troubleshooting

### Permission Denied

```tsx
if (result.status === 'denied' && !result.canAskAgain) {
  // User permanently denied - show settings button
  showPermissionRationale();
  openAppSettings();
}
```

### Location Services Disabled

```tsx
import { isLocationEnabled } from '../utils/permissions';

const enabled = await isLocationEnabled();
if (!enabled) {
  Alert.alert(
    'Location Services Disabled',
    'Please enable location services in settings'
  );
}
```

### Background Location Not Working

Убедитесь что:
1. Разрешения запрошены правильно
2. `app.json` настроен корректно
3. Фоновая задача зарегистрирована
4. Тестируйте на реальном устройстве (не в эмуляторе)








