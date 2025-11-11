# Исправление ошибки Metro Bundler "Требуется неизвестный модуль"

## Проблема
Ошибка: "Требуется неизвестный модуль «1139»"

Это проблема кеша Metro bundler. Модуль не может быть найден из-за поврежденного кеша.

## Решение

### Способ 1: Быстрое исправление (рекомендуется)

1. **Остановите Metro bundler** (если запущен):
   - Нажмите `Ctrl+C` в терминале, где запущен Metro

2. **Очистите кеш и перезапустите**:
   ```bash
   cd mobile-app
   npx expo start --clear
   ```

### Способ 2: Полная очистка

Если способ 1 не помог:

1. **Остановите Metro bundler**

2. **Очистите все кеши**:
   ```bash
   cd mobile-app
   
   # Очистка кеша Metro
   npx react-native start --reset-cache
   
   # Или для Expo:
   npx expo start --clear
   
   # Удаление кеша Expo
   rm -rf .expo
   rm -rf node_modules/.cache
   
   # На Windows PowerShell:
   Remove-Item -Recurse -Force .expo
   Remove-Item -Recurse -Force node_modules/.cache -ErrorAction SilentlyContinue
   ```

3. **Переустановите зависимости** (если нужно):
   ```bash
   npm install
   # или
   yarn install
   ```

4. **Перезапустите Metro**:
   ```bash
   npx expo start --clear
   ```

### Способ 3: Полная переустановка (если ничего не помогает)

1. **Остановите все процессы Metro/Expo**

2. **Удалите кеши и зависимости**:
   ```bash
   cd mobile-app
   
   # На Windows PowerShell:
   Remove-Item -Recurse -Force node_modules
   Remove-Item -Recurse -Force .expo
   Remove-Item -Recurse -Force node_modules/.cache -ErrorAction SilentlyContinue
   ```

3. **Переустановите зависимости**:
   ```bash
   npm install
   ```

4. **Запустите с очисткой кеша**:
   ```bash
   npx expo start --clear
   ```

## Профилактика

Если проблема повторяется часто:

1. Добавьте скрипт в `package.json`:
   ```json
   "start:clean": "npx expo start --clear"
   ```

2. Используйте его вместо обычного `npm start`:
   ```bash
   npm run start:clean
   ```

## Дополнительная информация

- Модуль "1139" - это внутренний идентификатор Metro bundler
- Ошибка возникает, когда Metro не может найти модуль в своем кеше
- Очистка кеша решает проблему в 99% случаев








