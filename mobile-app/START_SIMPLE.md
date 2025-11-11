# Простой запуск приложения

## Проблема с версиями пакетов?

Используйте этот подход:

### Шаг 1: Очистка

```powershell
cd "Z:\App RBT\mobile-app"

# Удалите lock файлы
if (Test-Path package-lock.json) { Remove-Item package-lock.json }
if (Test-Path yarn.lock) { Remove-Item yarn.lock }

# Удалите node_modules (если есть)
if (Test-Path node_modules) { Remove-Item -Recurse -Force node_modules }
```

### Шаг 2: Используйте expo install для автоматического подбора версий

```powershell
# Установите Expo CLI
npm install -g expo-cli

# Сначала установите базовые зависимости
npm install expo@latest react@18.2.0 react-native@0.73.6

# Теперь используйте expo install для всех Expo пакетов
# Это автоматически подберет правильные версии для вашего Expo SDK
npx expo install expo-local-authentication
npx expo install expo-location  
npx expo install expo-task-manager
npx expo install expo-document-picker
npx expo install expo-image-picker
npx expo install expo-image-manipulator
npx expo install expo-file-system
npx expo install expo-camera
npx expo install expo-image
npx expo install expo-crypto
npx expo install expo-av
npx expo install expo-notifications
npx expo install expo-device
npx expo install expo-sqlite
npx expo install expo-updates
npx expo install expo-build-properties

# Установите остальные зависимости
npm install
```

### Шаг 3: Запуск

```powershell
npm start
```

## Альтернативный подход: Минимальная версия для тестирования

Если нужно быстро протестировать, можно временно упростить:

1. Закомментируйте проблемные пакеты в `package.json`
2. Установите только базовые зависимости
3. Запустите через Expo Go
4. Добавляйте функции постепенно

## Проверка версии Expo

```powershell
npx expo --version
```

## Если ничего не помогает

1. Проверьте, что используется правильная версия Node.js (18+):
   ```powershell
   node --version
   ```

2. Обновите npm:
   ```powershell
   npm install -g npm@latest
   ```

3. Используйте yarn вместо npm:
   ```powershell
   npm install -g yarn
   yarn install
   ```








