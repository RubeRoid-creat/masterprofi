# Security Implementation Guide

Полное руководство по реализованным мерам безопасности для мобильного приложения.

## Реализованные компоненты

✅ **SSL Pinning** - Защита от MITM атак
✅ **Secure Local Storage Encryption** - Шифрование чувствительных данных
✅ **Biometric Authentication** - Улучшенная биометрическая аутентификация
✅ **Session Timeout** - Автоматическое завершение сессии
✅ **Remote Wipe Capability** - Удаленная очистка данных
✅ **Privacy Mode** - Режим конфиденциальности

## Компоненты безопасности

### 1. SSL Pinning

Защита API вызовов от MITM (Man-in-the-Middle) атак.

```typescript
import { sslPinningService } from './src/services/sslPinningService';

// Initialize (automatic in App.tsx)
await sslPinningService.initialize();

// Add certificate pin
sslPinningService.addCertificatePin('api.masterprofi.com', 'CERTIFICATE_HASH');
```

**Настройка:**
1. Получите SHA256 хэш сертификата сервера
2. Добавьте в `sslPinningService.ts`
3. Для production используйте `react-native-ssl-pinning` или native модуль

### 2. Secure Local Storage Encryption

Шифрование чувствительных данных в локальном хранилище.

```typescript
import { encryptionService } from './src/services/encryptionService';
import { useSecureStorage } from './src/hooks/useSecureStorage';

// Initialize with user ID
await encryptionService.initialize(userId);

// Store encrypted data
await encryptionService.encryptAndStore('sensitive_key', sensitiveData);

// Retrieve decrypted data
const data = await encryptionService.retrieveAndDecrypt('sensitive_key');

// Or use hook
const { setSecureItem, getSecureItem } = useSecureStorage(userId);
await setSecureItem('token', authToken);
const token = await getSecureItem('token');
```

**Что шифруется:**
- Auth tokens
- User credentials
- Payment information
- Personal data

### 3. Biometric Authentication

Улучшенная биометрическая аутентификация с защитой от брутфорса.

```typescript
import { biometricService } from './src/services/biometricService';

// Check availability
const available = await biometricService.isAvailable();

// Authenticate
const result = await biometricService.authenticate('Access your account');

if (result.success) {
  // Authentication successful
} else {
  console.error(result.error);
}

// Enable biometric for user
await biometricService.enable(userId);

// Check if enabled
const isEnabled = await biometricService.isEnabled(userId);
```

**Функции:**
- Автоматическая блокировка после неудачных попыток
- Временная блокировка (30 секунд после 5 попыток)
- Сохранение состояния между сессиями

### 4. Session Timeout

Автоматическое завершение сессии при бездействии.

```typescript
import { sessionService } from './src/services/sessionService';

// Initialize with config
sessionService.initialize({
  timeout: 30 * 60 * 1000, // 30 minutes
  warningTime: 5 * 60 * 1000, // 5 minutes warning
  extendOnActivity: true,
});

// Record user activity
sessionService.recordActivity();

// Setup callbacks
sessionService.onTimeout(() => {
  // Logout user
});

sessionService.onWarning((remainingSeconds) => {
  // Show warning to user
});

// Get session info
const info = sessionService.getSessionInfo();
console.log(`Remaining: ${info.remaining}ms`);
```

**Настройки:**
- Таймаут по умолчанию: 30 минут
- Предупреждение: за 5 минут до таймаута
- Автоматическое продление при активности пользователя
- Пауза при переходе в background

### 5. Remote Wipe Capability

Удаленная очистка данных устройства.

```typescript
import { remoteWipeService } from './src/services/remoteWipeService';

// Initialize with user ID
remoteWipeService.initialize(userId);

// Check status periodically (automatic)
// Or manually trigger
await remoteWipeService.triggerWipe();
```

**Что удаляется:**
- AsyncStorage (все данные)
- База данных (WatermelonDB)
- Кэш файлов
- Документы
- Encryption keys

**Настройка:**
- Проверка статуса каждые 5 минут
- Endpoint: `/api/security/wipe-status`
- Автоматическое выполнение при получении команды

### 6. Privacy Mode

Режим конфиденциальности для защиты чувствительных данных.

```typescript
import { privacyModeService } from './src/services/privacyModeService';
import { PrivacyModeOverlay } from './src/components/PrivacyModeOverlay';
import { SensitiveData } from './src/components/SensitiveData';

// Initialize
privacyModeService.initialize({
  autoEnableOnBackground: true,
  autoEnableOnScreenLock: true,
  blurScreenshots: true,
  hideNotifications: true,
});

// Enable/disable
await privacyModeService.enable();
await privacyModeService.disable();

// Use in components
<SensitiveData value="1234567890" visibleChars={4} />
```

**Функции:**
- Автоматическая активация при переходе в background
- Маскировка чувствительных данных
- Скрытие уведомлений
- Overlay для защиты экрана

## Интеграция в приложение

### App.tsx

Все сервисы безопасности автоматически инициализируются:

```typescript
// SSL Pinning
await sslPinningService.initialize();

// Biometric
await biometricService.loadSecurityState();

// Privacy Mode
privacyModeService.initialize();

// Session Management (инициализируется после login)
sessionService.initialize();

// Remote Wipe (инициализируется после login)
remoteWipeService.initialize(userId);
```

### Защита экранов

Оберните приложение в `PrivacyModeOverlay`:

```tsx
<PrivacyModeOverlay>
  <YourApp />
</PrivacyModeOverlay>
```

### Защита данных

Используйте `SensitiveData` компонент:

```tsx
<SensitiveData 
  value={userPhone} 
  visibleChars={4}
  allowToggle={true}
/>
```

## Best Practices

1. **SSL Pinning**
   - Используйте backup сертификаты
   - Обновляйте сертификаты перед истечением
   - Отключайте в development

2. **Encryption**
   - Шифруйте все чувствительные данные
   - Используйте сильные ключи
   - Очищайте ключи при logout

3. **Biometric**
   - Не используйте как единственный метод аутентификации
   - Всегда предоставляйте fallback
   - Логируйте попытки аутентификации

4. **Session Timeout**
   - Настройте разумный таймаут
   - Уведомляйте пользователей о предстоящем таймауте
   - Позволяйте продлить сессию

5. **Remote Wipe**
   - Тестируйте на тестовых устройствах
   - Уведомляйте пользователей о возможности
   - Сохраняйте логи операций

6. **Privacy Mode**
   - Активируйте автоматически в background
   - Предоставляйте ручное управление
   - Маскируйте данные в логах

## Настройка сервера

### Remote Wipe Endpoint

Создайте endpoint для проверки статуса удаленной очистки:

```typescript
GET /api/security/wipe-status

Response:
{
  "shouldWipe": true/false
}
```

### SSL Certificate Pins

Получите SHA256 хэши сертификатов:

```bash
# Get certificate
openssl s_client -connect api.masterprofi.com:443 -showcerts

# Calculate SHA256 hash
openssl x509 -pubkey -noout -in cert.pem | \
  openssl pkey -pubin -outform der | \
  openssl dgst -sha256 -binary | \
  openssl enc -base64
```

## Тестирование

### SSL Pinning
```bash
# Test with proxy
mitmproxy --set confdir=~/.mitmproxy
```

### Encryption
```typescript
const encrypted = await encryptionService.encrypt('test data');
const decrypted = await encryptionService.decrypt(encrypted);
console.assert(decrypted === 'test data');
```

### Biometric
- Тестируйте на реальном устройстве
- Проверяйте блокировку после множественных попыток

### Session Timeout
```typescript
sessionService.updateConfig({ timeout: 60000 }); // 1 minute for testing
```

### Remote Wipe
- Тестируйте на тестовом устройстве
- Проверяйте что все данные удаляются

## Troubleshooting

### SSL Pinning Fails
- Проверьте хэши сертификатов
- Убедитесь что используете правильный сертификат
- Проверьте что сертификат не истек

### Encryption Not Working
- Проверьте что `initialize()` вызван
- Убедитесь что userId предоставлен
- Проверьте доступность expo-crypto

### Biometric Not Available
- Проверьте что устройство поддерживает
- Убедитесь что биометрия настроена
- Проверьте разрешения

### Session Timeout Too Aggressive
- Увеличьте `timeout` в конфигурации
- Проверьте что `recordActivity()` вызывается
- Убедитесь что `extendOnActivity: true`

## Compliance

Эти меры безопасности помогают соответствовать:
- GDPR (General Data Protection Regulation)
- CCPA (California Consumer Privacy Act)
- PCI DSS (для платежных данных)
- HIPAA (для медицинских данных, если применимо)








