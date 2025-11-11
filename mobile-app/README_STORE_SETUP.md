# Store Setup Guide

Полное руководство по настройке приложения для публикации в App Store и Google Play Store.

## Реализованные компоненты

✅ **App Icons** - Генерация иконок для всех разрешений
✅ **Splash Screens** - Splash экраны для всех устройств
✅ **Privacy Policy Integration** - Компонент и интеграция
✅ **App Store Screenshots** - Шаблоны и инструкции
✅ **Release Notes Templates** - Шаблоны release notes
✅ **Beta Testing Setup** - Настройка TestFlight и Play Console
✅ **OTA Updates Configuration** - Настройка Expo Updates

## Структура файлов

```
mobile-app/
├── assets/
│   ├── icon.png                 # Source icon (1024x1024)
│   ├── adaptive-icon.png        # Android adaptive icon
│   ├── splash.png              # Source splash
│   ├── notification-icon.png   # Notification icon
│   └── screenshots/            # App Store screenshots
├── scripts/
│   ├── generate-icons.js       # Icon generation
│   ├── generate-splash.js       # Splash generation
│   ├── generate-screenshots.js  # Screenshot templates
│   ├── generate-release-notes.js # Release notes generator
│   ├── configure-ota.js        # OTA configuration
│   └── store-checklist.md      # Submission checklist
├── release-notes/               # Generated release notes
├── app.json                    # Expo configuration
├── app.config.js              # Enhanced config (optional)
├── eas.json                   # EAS Build configuration
└── ota-config.json            # OTA updates config
```

## App Icons

### Генерация иконок

```bash
# Запустить скрипт для инструкций
node scripts/generate-icons.js

# Использовать инструменты:
# - ImageMagick: magick convert icon.png -resize SIZE icon-SIZE.png
# - Online: https://www.appicon.co/
# - Expo: npx @expo/image-utils
```

### Требования iOS

- 1024x1024px для App Store
- Все размеры @2x и @3x
- Без прозрачности
- PNG формат

### Требования Android

- 512x512px для Play Store
- Mipmap иконки для всех плотностей
- Adaptive icon (foreground + background)

## Splash Screens

### Генерация

```bash
node scripts/generate-splash.js
```

### Требования

- iOS: Все размеры для iPhone и iPad
- Android: Для всех плотностей (ldpi до xxxhdpi)
- Логотип по центру
- Фоновый цвет: #3B82F6

## Privacy Policy

### Компонент

```tsx
import { PrivacyPolicy } from './src/components/PrivacyPolicy';

<PrivacyPolicy
  onAccept={() => {}}
  onDecline={() => {}}
  showAcceptButtons={true}
/>
```

### Интеграция

1. Создайте страницу Privacy Policy на вашем сайте
2. Обновите URL в компоненте
3. Добавьте ссылку в настройках приложения
4. Убедитесь что ссылка доступна перед публикацией

## App Store Screenshots

### Генерация шаблонов

```bash
node scripts/generate-screenshots.js
```

### Требования iOS

- Минимум 3, максимум 10 скриншотов
- Размеры для всех обязательных устройств
- JPG или PNG, без прозрачности
- Реальные скриншоты (не мокапы)

### Требования Android

- Минимум 2, максимум 8 скриншотов
- Feature graphic: 1024x500px
- Для телефонов и планшетов

## Release Notes

### Генерация

```bash
# Release
node scripts/generate-release-notes.js 1.0.0 release

# Hotfix
node scripts/generate-release-notes.js 1.0.1 hotfix

# Beta
node scripts/generate-release-notes.js 1.0.0-beta beta

# Security update
node scripts/generate-release-notes.js 1.0.2 security
```

### Шаблоны

Шаблоны находятся в `scripts/release-notes-templates.md`:
- Initial Release
- Feature Update
- Hotfix
- Beta Release
- Security Update

## Beta Testing

### TestFlight (iOS)

```bash
# Build
eas build --platform ios --profile preview

# Submit
eas submit --platform ios
```

### Google Play Internal Testing

```bash
# Build
eas build --platform android --profile production

# Submit to internal track
eas submit --platform android --track internal
```

### Настройка

1. Создайте тестовую группу
2. Добавьте тестеров
3. Загрузите build
4. Отправьте приглашения

Подробнее: `scripts/beta-testing-setup.md`

## OTA Updates

### Конфигурация

```bash
node scripts/configure-ota.js
```

### Публикация обновлений

```bash
# Development
eas update --branch development --message "Update message"

# Preview
eas update --branch preview --message "Update message"

# Production
eas update --branch production --message "Update message"

# Or use script
./scripts/publish-update.sh production "Update message"
```

### Каналы

- **production**: Официальные обновления
- **preview**: Бета тестирование
- **development**: Разработка

### Ограничения

- Не более 50MB на обновление
- Только JavaScript/TypeScript изменения
- Нельзя изменить нативный код
- Требуется совместимый runtimeVersion

## Submission Process

### Checklist

Используйте `scripts/store-checklist.md` для полной проверки перед публикацией.

### Команды

```bash
# Build for production
eas build --platform ios --profile production
eas build --platform android --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

## EAS Build Configuration

### Профили сборки

- **development**: Development build с Expo Dev Client
- **preview**: Preview build для тестирования
- **production**: Production build для сторов

### Настройка

Отредактируйте `eas.json`:
- Добавьте ваш Apple ID для iOS
- Добавьте Google Service Account для Android
- Настройте project ID

## Best Practices

1. **Test Before Submit** - Тестируйте на реальных устройствах
2. **Screenshots** - Используйте реальные скриншоты
3. **Release Notes** - Пишите понятные release notes
4. **Beta First** - Всегда тестируйте в beta перед production
5. **Monitor Updates** - Следите за успешностью OTA updates
6. **Version Management** - Правильно управляйте версиями

## Troubleshooting

### Build Errors

1. Проверьте certificates (iOS)
2. Проверьте signing key (Android)
3. Убедитесь что все зависимости установлены

### Submission Rejected

1. Проверьте причину отказа
2. Исправьте проблемы
3. Обновите metadata если нужно
4. Resubmit

### OTA Updates Not Working

1. Проверьте runtimeVersion
2. Убедитесь что updates.enabled = true
3. Проверьте канал обновлений
4. Проверьте размер обновления








