# E2E Testing with Detox

Комплексная система E2E тестирования с использованием Detox для React Native приложения.

## Реализованные E2E тесты

✅ **User Registration Flow** - Полный процесс регистрации
✅ **Order Acceptance Process** - Процесс принятия заказов
✅ **Chat Functionality** - Функциональность чата
✅ **Payment Workflow** - Рабочий процесс платежей
✅ **Offline Mode Testing** - Тестирование офлайн режима
✅ **Push Notification Handling** - Обработка push уведомлений

## Установка

```bash
# Установить Detox
npm install --save-dev detox @types/detox

# Для iOS (требуется macOS)
brew tap wix/brew
brew install applesimutils

# Для Android
# Убедитесь что Android SDK установлен
```

## Настройка

### iOS

1. Создайте Xcode workspace (если не существует)
2. Настройте схему в Xcode
3. Убедитесь что симуляторы доступны

### Android

1. Создайте AVD (Android Virtual Device)
2. Убедитесь что Android SDK настроен
3. Проверьте переменные окружения ANDROID_HOME

## Запуск тестов

```bash
# Собрать приложение для iOS
npm run e2e:build:ios

# Запустить тесты на iOS
npm run e2e:test:ios

# Собрать приложение для Android
npm run e2e:build:android

# Запустить тесты на Android
npm run e2e:test:android

# Запустить в release режиме
npm run e2e:test:ios:release
npm run e2e:test:android:release
```

## Структура тестов

```
e2e/
├── jest.config.js              # Jest конфигурация для Detox
├── init.ts                      # Инициализация Detox
├── testIds.ts                   # Централизованные test ID
├── helpers/
│   └── testHelpers.ts          # Вспомогательные функции
└── flows/
    ├── registration.e2e.ts     # Тесты регистрации
    ├── orderAcceptance.e2e.ts   # Тесты принятия заказов
    ├── chat.e2e.ts              # Тесты чата
    ├── payment.e2e.ts           # Тесты платежей
    ├── offlineMode.e2e.ts       # Тесты офлайн режима
    └── pushNotifications.e2e.ts # Тесты уведомлений
```

## Тестовые сценарии

### User Registration Flow

- ✅ Полная регистрация (личные данные → навыки → зона обслуживания → верификация → документы → условия)
- ✅ Валидация форм
- ✅ Таймаут верификации
- ✅ Обработка сетевых ошибок

### Order Acceptance Process

- ✅ Принятие заказа из ленты
- ✅ Принятие через swipe жесты
- ✅ Отклонение заказа
- ✅ Принятие офлайн
- ✅ Фильтрация по статусу
- ✅ Отображение деталей заказа

### Chat Functionality

- ✅ Отправка текстовых сообщений
- ✅ Отправка изображений
- ✅ Голосовые сообщения
- ✅ Быстрые ответы
- ✅ Получение сообщений
- ✅ Чат офлайн

### Payment Workflow

- ✅ Просмотр баланса
- ✅ Запрос вывода средств
- ✅ История платежей
- ✅ Фильтрация по дате
- ✅ Расчет налогов
- ✅ Управление методами оплаты

### Offline Mode Testing

- ✅ Индикатор офлайн режима
- ✅ Очередь действий
- ✅ Синхронизация при восстановлении связи
- ✅ Кэширование заказов
- ✅ Детали заказа офлайн
- ✅ Повторная попытка синхронизации

### Push Notification Handling

- ✅ Запрос разрешений
- ✅ Отображение уведомлений
- ✅ Навигация по уведомлениям
- ✅ Уведомления в фоне
- ✅ Уведомления при закрытом приложении
- ✅ Различные типы уведомлений
- ✅ Обновление badge
- ✅ Deep linking
- ✅ Отклонение разрешений

## Test IDs

Все тестовые идентификаторы централизованы в `e2e/testIds.ts`:

```typescript
TestIDs.orderCard('order-1')
TestIDs.chatInput
TestIDs.paymentSubmitButton
```

## Best Practices

1. **Use Test IDs** - Используйте централизованные test ID
2. **Wait for Elements** - Всегда ждите появления элементов
3. **Network Conditions** - Тестируйте различные сетевые условия
4. **Clean State** - Очищайте состояние между тестами
5. **Screenshots** - Делайте скриншоты при ошибках
6. **Timeout Settings** - Настраивайте таймауты соответственно

## Troubleshooting

### Tests not running

1. Убедитесь что приложение собрано
2. Проверьте что эмулятор/симулятор запущен
3. Проверьте конфигурацию Detox

### Elements not found

1. Увеличьте таймауты
2. Проверьте что test ID правильно установлены
3. Убедитесь что элемент видим

### Network issues

1. Проверьте сетевые условия
2. Убедитесь что моки настроены правильно
3. Проверьте таймауты для сетевых запросов








