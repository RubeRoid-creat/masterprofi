# Как запустить приложение

## Шаг 1: Установка зависимостей

```bash
cd mobile-app
npm install
```

**Если возникают проблемы с версиями пакетов Expo**, используйте:

```bash
# Установите Expo CLI глобально (если еще не установлен)
npm install -g expo-cli

# Используйте expo install для автоматического подбора версий
npx expo install --fix
```

## Шаг 2: Настройка окружения (опционально)

Создайте файл `.env` в папке `mobile-app`:

```env
EXPO_PUBLIC_ENV=development
EXPO_PUBLIC_API_URL_DEV=http://localhost:3000/api
```

## Шаг 3: Запуск приложения

### Вариант 1: С Expo Go (самый простой)

1. Установите **Expo Go** на телефон:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Запустите dev server:
   ```bash
   npm start
   ```

3. Отсканируйте QR-код в терминале

### Вариант 2: Android эмулятор/устройство

```bash
npm run android
```

### Вариант 3: iOS симулятор (только macOS)

```bash
npm run ios
```

### Вариант 4: Веб-браузер (для тестирования)

```bash
npm run web
```

## Быстрые команды

```bash
# Запуск dev server
npm start

# Запуск с очисткой кеша
npm start -- --clear

# Запуск на Android
npm run android

# Запуск на iOS
npm run ios

# Запуск в браузере
npm run web
```

## Если что-то не работает

### Очистка и переустановка

```bash
# Удалить node_modules и lock файлы
rm -rf node_modules package-lock.json

# Переустановить зависимости
npm install

# Очистить Expo кеш
npm start -- --clear
```

### Проблемы с версиями пакетов

Если есть ошибки совместимости, используйте:

```bash
npx expo install --fix
```

Это автоматически подберет правильные версии для вашей версии Expo.

### Проверка установки

```bash
# Проверить версию Node.js (должна быть 18+)
node --version

# Проверить версию npm
npm --version

# Проверить установлен ли Expo CLI
npx expo --version
```

## Первый запуск

При первом запуске Expo может запросить:
- Создание аккаунта Expo (можно пропустить для локальной разработки)
- Выбор туннеля/локальной сети (выберите "LAN" для локальной сети)

## Структура команд

Все команды выполняются из папки `mobile-app`:

```
Z:\App RBT\mobile-app> npm start
```

Готово! После запуска откройте Expo Go на телефоне и отсканируйте QR-код, или нажмите `a` для Android / `i` для iOS в терминале.








