# 📱 Настройка и сборка мобильного приложения

## ✅ Что уже сделано:
- ✅ Конфигурация обновлена для подключения к серверу `212.74.227.208:3000`
- ✅ Production и Staging окружения настроены

## 📋 Следующие шаги:

### 1. Установите зависимости (если еще не установлены)

```bash
cd mobile-app
npm install
```

### 2. Настройте Expo EAS (Expo Application Services)

#### Установите EAS CLI:

```bash
npm install -g eas-cli
```

#### Войдите в Expo:

```bash
eas login
```

#### Создайте проект в Expo (если еще не создан):

```bash
cd mobile-app
eas init
```

Это создаст проект в Expo и обновит `eas.json` с правильным `projectId`.

### 3. Обновите app.config.js

Откройте `mobile-app/app.config.js` и обновите:

```javascript
extra: {
  eas: {
    projectId: 'ваш-project-id-из-expo', // Замените на реальный projectId
  },
  // ...
}
```

### 4. Настройте переменные окружения (опционально)

Можно создать `.env` файл в `mobile-app/`:

```env
EXPO_PUBLIC_API_URL_PROD=http://212.74.227.208:3000/api
EXPO_PUBLIC_WS_URL_PROD=ws://212.74.227.208:3000
EXPO_PUBLIC_API_URL_STAGING=http://212.74.227.208:3000/api
EXPO_PUBLIC_WS_URL_STAGING=ws://212.74.227.208:3000
```

### 5. Тестирование в development режиме

#### Запуск на эмуляторе/симуляторе:

```bash
cd mobile-app

# Для Android
npm run android

# Для iOS (только на Mac)
npm run ios

# Или через Expo Go
npm start
```

**Важно:** В development режиме приложение будет подключаться к `localhost:3000` или `10.0.2.2:3000` (для Android эмулятора).

Для подключения к реальному серверу в development, установите переменную:

```bash
export EXPO_PUBLIC_API_URL_DEV=http://212.74.227.208:3000/api
npm start
```

### 6. Сборка для тестирования (Preview)

#### Android APK:

```bash
cd mobile-app
eas build --platform android --profile preview
```

#### iOS (только на Mac):

```bash
eas build --platform ios --profile preview
```

После сборки вы получите ссылку для скачивания APK/IPA файла.

### 7. Сборка для production

#### Android:

```bash
eas build --platform android --profile production
```

#### iOS:

```bash
eas build --platform ios --profile production
```

### 8. Публикация в магазины

#### Google Play Store:

1. Создайте аккаунт разработчика Google Play
2. Настройте `google-service-account.json` в `eas.json`
3. Выполните:

```bash
eas submit --platform android
```

#### Apple App Store:

1. Создайте аккаунт разработчика Apple
2. Настройте Apple ID в `eas.json`
3. Выполните:

```bash
eas submit --platform ios
```

## 🔧 Настройка для реального сервера

### Если у вас есть домен:

После настройки домена и SSL, обновите конфигурацию:

1. **environments.ts:**
```typescript
production: {
  apiUrl: 'https://yourdomain.com/api',
  wsUrl: 'wss://yourdomain.com',
}
```

2. **eas.json:**
```json
"EXPO_PUBLIC_API_URL_PROD": "https://yourdomain.com/api",
"EXPO_PUBLIC_WS_URL_PROD": "wss://yourdomain.com"
```

3. **app.config.js:**
```javascript
apiUrl: 'https://yourdomain.com/api'
```

### Важно для HTTPS:

Если используете HTTP (не HTTPS), Android 9+ требует настройки Network Security Config:

1. Создайте `mobile-app/android/app/src/main/res/xml/network_security_config.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">212.74.227.208</domain>
    </domain-config>
</network-security-config>
```

2. Добавьте в `mobile-app/android/app/src/main/AndroidManifest.xml`:

```xml
<application
    android:networkSecurityConfig="@xml/network_security_config"
    ...>
```

## 🧪 Тестирование подключения

### Проверка API из мобильного приложения:

1. Запустите приложение
2. Попробуйте войти
3. Проверьте консоль на наличие ошибок подключения

### Проверка CORS на сервере:

Убедитесь, что backend разрешает запросы с мобильных приложений. В `backend/src/main.ts` уже настроено разрешение всех запросов в production.

## 📝 Чеклист для мобильного приложения:

- [ ] Зависимости установлены (`npm install`)
- [ ] EAS CLI установлен и настроен
- [ ] Project ID обновлен в `app.config.js`
- [ ] API URL настроен на `212.74.227.208:3000`
- [ ] Тестирование в development режиме
- [ ] Сборка preview версии
- [ ] Тестирование preview версии на реальных устройствах
- [ ] Сборка production версии
- [ ] Публикация в магазины (опционально)

## 🚀 Быстрый старт для тестирования:

```bash
cd mobile-app

# Установите зависимости
npm install

# Запустите в development режиме
npm start

# Или соберите APK для тестирования
eas build --platform android --profile preview
```

## ⚠️ Важные замечания:

1. **HTTP vs HTTPS:** Если используете HTTP, Android требует настройки Network Security Config
2. **CORS:** Backend должен разрешать запросы с мобильных приложений (уже настроено)
3. **WebSocket:** Убедитесь, что WebSocket соединения работают через ваш firewall
4. **Push Notifications:** Требуют настройки Firebase/APNs (опционально)

