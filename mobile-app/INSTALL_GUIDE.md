# Инструкция по установке и запуску

## Проблема с версиями пакетов

Если возникают ошибки установки зависимостей, используйте этот подход:

### Вариант 1: Автоматическая установка (рекомендуется)

```powershell
# 1. Перейдите в папку проекта
cd "Z:\App RBT\mobile-app"

# 2. Установите Expo CLI глобально (если еще не установлен)
npm install -g expo-cli

# 3. Установите только базовые зависимости сначала
npm install expo@~50.0.0 react@18.2.0 react-native@0.73.6

# 4. Используйте expo install для остальных пакетов
npx expo install expo-local-authentication expo-location expo-task-manager expo-document-picker expo-image-picker expo-image-manipulator expo-file-system expo-camera expo-image expo-crypto expo-av expo-notifications expo-device expo-sqlite expo-updates expo-build-properties

# 5. Установите остальные зависимости
npm install
```

### Вариант 2: Упрощенная версия (только для запуска)

Если нужен быстрый запуск без всех функций:

```powershell
cd "Z:\App RBT\mobile-app"

# Установите только самое необходимое
npm install expo@~50.0.0 react@18.2.0 react-native@0.73.6

# Установите зависимости через expo install по одной категории
npx expo install expo-local-authentication
npx expo install expo-location
npx expo install expo-image-picker
npx expo install expo-camera
npx expo install expo-notifications

# Установите React Navigation
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack @react-navigation/native-stack react-native-screens react-native-safe-area-context react-native-gesture-handler

# Установите Redux
npm install @reduxjs/toolkit react-redux

# Остальное установите по мере необходимости
```

### Вариант 3: Исправление версий вручную

Если продолжаются ошибки, можно временно закомментировать проблемные пакеты в `package.json` и устанавливать их позже.

## Запуск после установки

```powershell
# Запуск dev server
npm start

# Или с очисткой кеша
npm start -- --clear
```

## Альтернатива: Использование Expo Go без нативного кода

Если проблемы продолжаются, можно временно убрать пакеты, требующие нативного кода, и запустить базовую версию через Expo Go.








