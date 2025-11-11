# Quick Start Guide

Быстрое руководство по запуску MasterProfi Mobile приложения.

## Предварительные требования

### Установленные инструменты:

1. **Node.js** (v18 или выше)
   ```bash
   node --version
   ```

2. **npm** или **yarn**
   ```bash
   npm --version
   ```

3. **Expo CLI** (опционально, для глобальной установки)
   ```bash
   npm install -g expo-cli
   ```

4. **EAS CLI** (для билдов)
   ```bash
   npm install -g eas-cli
   ```

5. **Для Android:**
   - Android Studio
   - Android SDK
   - Java JDK 17+

6. **Для iOS (только macOS):**
   - Xcode
   - CocoaPods

## Быстрый старт

### 1. Установка зависимостей

```bash
cd mobile-app
npm install
```

### 2. Настройка окружения

Создайте файл `.env` на основе `.env.example`:

```bash
# Скопируйте пример
cp .env.example .env

# Отредактируйте .env файл
# Заполните значения API URLs и других переменных
```

### 3. Запуск в Development режиме

#### Запуск Expo Dev Server

```bash
npm start
```

Или с очисткой кеша:

```bash
npm start -- --clear
```

#### Запуск на Android

```bash
npm run android
```

Или через Expo:

```bash
npx expo start --android
```

#### Запуск на iOS (только macOS)

```bash
npm run ios
```

Или через Expo:

```bash
npx expo start --ios
```

#### Запуск в браузере (для тестирования)

```bash
npm run web
```

### 4. Использование Expo Go (без нативного билда)

1. Установите Expo Go на телефон:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Запустите dev server:
   ```bash
   npm start
   ```

3. Отсканируйте QR-код в терминале:
   - iOS: Камера
   - Android: Expo Go app

## Скрипты для разработки

### Основные команды

```bash
# Запуск dev server
npm start

# Запуск на Android
npm run android

# Запуск на iOS
npm run ios

# Запуск в браузере
npm run web

# Тесты
npm test
npm run test:watch
npm run test:coverage

# E2E тесты (требуют настройки Detox)
npm run e2e:build:android
npm run e2e:test:android
```

### Генерация assets

```bash
# Генерация иконок
npm run generate:icons

# Генерация splash screens
npm run generate:splash

# Генерация скриншотов шаблонов
npm run generate:screenshots

# Генерация release notes
npm run generate:release-notes 1.0.0 release
```

## Настройка для разработки

### 1. Выбор окружения

По умолчанию используется `development`. Чтобы изменить:

```bash
# Development (по умолчанию)
EXPO_PUBLIC_ENV=development npm start

# Staging
EXPO_PUBLIC_ENV=staging npm start

# Production
EXPO_PUBLIC_ENV=production npm start
```

### 2. Настройка API URLs

В файле `.env`:

```env
EXPO_PUBLIC_API_URL_DEV=http://localhost:3000/api
EXPO_PUBLIC_API_URL_STAGING=https://api-staging.masterprofi.com/api
EXPO_PUBLIC_API_URL_PROD=https://api.masterprofi.com/api
```

### 3. Настройка для тестирования на реальном устройстве

Если API запущен локально, убедитесь что устройство может достучаться до вашего компьютера:

**Для Android эмулятора:**
- Используйте `10.0.2.2` вместо `localhost`

**Для iOS симулятора:**
- Используйте `localhost` или IP адрес Mac

**Для реального устройства:**
- Используйте IP адрес вашего компьютера в локальной сети:
  ```env
  EXPO_PUBLIC_API_URL_DEV=http://192.168.1.100:3000/api
  ```

## Сборка для продакшена

### EAS Build

```bash
# Логин в EAS
eas login

# Настройка проекта (первый раз)
eas build:configure

# Сборка для Android
npm run build:android
# или
eas build --platform android --profile production

# Сборка для iOS
npm run build:ios
# или
eas build --platform ios --profile production
```

### Локальная сборка (требует нативный код)

```bash
# Android APK
npx expo run:android --variant release

# iOS (требует Xcode)
npx expo run:ios --configuration Release
```

## Troubleshooting

### Проблемы с зависимостями

```bash
# Очистка и переустановка
rm -rf node_modules package-lock.json
npm install

# Очистка Expo кеша
npm start -- --clear
```

### Проблемы с Metro bundler

```bash
# Очистка кеша Metro
npx react-native start --reset-cache

# Или через Expo
npm start -- --clear
```

### Проблемы с iOS (macOS)

```bash
cd ios
pod install
cd ..
npm run ios
```

### Проблемы с Android

```bash
# Очистка Android кеша
cd android
./gradlew clean
cd ..

# Проверка Android SDK
# Откройте Android Studio > SDK Manager
```

### Проблемы с TypeScript

```bash
# Проверка типов
npx tsc --noEmit

# Исправление авто-фиксируемых ошибок
npx tsc --noEmit --fix
```

## Структура проекта

```
mobile-app/
├── src/
│   ├── components/     # React компоненты
│   ├── screens/        # Экраны приложения
│   ├── navigation/     # Навигация
│   ├── services/       # Сервисы (API, аналитика, etc.)
│   ├── store/          # Redux store
│   ├── hooks/          # Custom hooks
│   ├── types/          # TypeScript типы
│   └── utils/          # Утилиты
├── assets/             # Изображения, иконки
├── app.json            # Expo конфигурация
├── package.json        # Зависимости
└── .env                # Переменные окружения
```

## Полезные ссылки

- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [TypeScript](https://www.typescriptlang.org/)

## Поддержка

При возникновении проблем:
1. Проверьте логи в терминале
2. Проверьте документацию в `README_*.md` файлах
3. Убедитесь что все зависимости установлены
4. Проверьте настройки окружения в `.env`








