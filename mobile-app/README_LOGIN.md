# Login Screen Component

Полнофункциональный экран входа для React Native с поддержкой всех современных функций.

## Особенности

✅ **Email/Phone Input** - Поле для ввода email или телефона с валидацией  
✅ **Password Field** - Поле пароля с безопасным вводом  
✅ **Remember Me** - Чекбокс "Запомнить меня"  
✅ **Forgot Password** - Ссылка на восстановление пароля  
✅ **Login Button** - Кнопка входа с индикатором загрузки  
✅ **Social Login** - Кнопки социального входа (Google, Apple, Facebook)  
✅ **Error Messages** - Отображение ошибок валидации и сети  
✅ **Keyboard Avoiding** - Автоматическая прокрутка при появлении клавиатуры  
✅ **TypeScript Interfaces** - Полная типизация  
✅ **Tailwind CSS** - Стилизация через NativeWind  
✅ **Accessibility** - Полная поддержка доступности  

## Дополнительные функции

- **React Hook Form** - Валидация форм
- **Biometric Authentication** - Готовность к биометрической аутентификации
- **Offline Capability** - Проверка сетевого соединения
- **Auto-fill Support** - Поддержка автозаполнения
- **Secure Storage** - Безопасное хранение credentials

## Установка зависимостей

```bash
npm install
# или
yarn install
```

## Использование

```tsx
import { LoginScreen } from './src/screens/LoginScreen';

function App() {
  const handleLogin = async (data: LoginFormData) => {
    // Ваша логика входа
    console.log('Login:', data);
  };

  const handleForgotPassword = () => {
    // Переход на экран восстановления пароля
    navigation.navigate('ForgotPassword');
  };

  const handleSocialLogin = async (provider: 'google' | 'apple' | 'facebook') => {
    // Интеграция с провайдерами социального входа
    console.log('Social login:', provider);
  };

  return (
    <LoginScreen
      onLogin={handleLogin}
      onForgotPassword={handleForgotPassword}
      onSocialLogin={handleSocialLogin}
      showSocialLogin={true}
    />
  );
}
```

## Настройка NativeWind

Убедитесь, что NativeWind настроен в вашем проекте:

1. Установите NativeWind:
```bash
npm install nativewind
```

2. Настройте `babel.config.js`:
```js
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['nativewind/babel'],
  };
};
```

3. Добавьте в `tailwind.config.js`:
```js
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  // ...
}
```

## Биометрическая аутентификация

Компонент автоматически проверяет доступность биометрии и отображает кнопку при наличии:

- Face ID (iOS)
- Touch ID / Fingerprint (iOS/Android)
- Iris (Android)

## Проверка офлайн режима

Компонент проверяет сетевое соединение. Для полной реализации используйте `@react-native-community/netinfo`:

```bash
npm install @react-native-community/netinfo
```

## Безопасное хранение

Для сохранения credentials используйте `expo-secure-store`:

```bash
npm install expo-secure-store
```

## Кастомизация

Все стили используют Tailwind CSS через NativeWind. Вы можете легко изменить цвета, отступы и другие параметры в компоненте или через тему Tailwind.

## Типы

```typescript
interface LoginFormData {
  emailOrPhone: string;
  password: string;
  rememberMe: boolean;
}

interface LoginScreenProps {
  onLogin?: (data: LoginFormData) => Promise<void>;
  onForgotPassword?: () => void;
  onSocialLogin?: (provider: 'google' | 'apple' | 'facebook') => Promise<void>;
  showSocialLogin?: boolean;
}
```









