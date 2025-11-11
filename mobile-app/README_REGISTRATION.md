# Registration Screen for Service Masters

Многошаговая форма регистрации для мастеров сервиса со всеми необходимыми функциями.

## Особенности

✅ **Step-by-step Form** - Пошаговая форма с 6 шагами  
✅ **Personal Info** - Персональная информация  
✅ **Phone Verification** - Подтверждение телефона через OTP  
✅ **Skills Selection** - Выбор навыков (множественные приборы)  
✅ **Service Area Map** - Выбор зоны обслуживания на карте  
✅ **Document Upload** - Загрузка сертификатов и портфолио  
✅ **Terms Acceptance** - Чекбоксы принятия условий  
✅ **Real-time Validation** - Валидация в реальном времени  
✅ **Progress Indicator** - Индикатор прогресса  

## Структура шагов

1. **Personal Information** (16%)
   - Имя, фамилия
   - Email
   - Телефон
   - Город, адрес

2. **Phone Verification** (33%)
   - OTP код (6 цифр)
   - Автоматическая отправка
   - Таймер повторной отправки

3. **Skills & Experience** (50%)
   - Выбор приборов (множественный)
   - Годы опыта
   - Специализации

4. **Service Area** (66%)
   - Карта с выбором центра
   - Радиус обслуживания
   - Текущее местоположение

5. **Documents** (83%)
   - Сертификаты (PDF/изображения)
   - Портфолио (изображения)
   - ID документ (опционально)

6. **Terms & Conditions** (100%)
   - Условия использования
   - Политика конфиденциальности
   - Подтверждение и отправка

## Установка зависимостей

```bash
npm install
```

## Использование

```tsx
import { RegistrationScreen } from './src/screens/RegistrationScreen';
import { RegistrationFormData } from './src/types/registration';

function App() {
  const handleRegistration = async (data: RegistrationFormData) => {
    // Отправка данных на сервер
    console.log('Registration data:', data);
    
    // Пример API вызова
    // const response = await fetch('https://api.example.com/masters/register', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data),
    // });
  };

  const handleCancel = () => {
    // Обработка отмены регистрации
    navigation.goBack();
  };

  return (
    <RegistrationScreen
      onComplete={handleRegistration}
      onCancel={handleCancel}
    />
  );
}
```

## Компоненты

### RegistrationScreen
Главный компонент, управляющий навигацией между шагами.

### Step Components
- `PersonalInfoStep` - Шаг персональной информации
- `PhoneVerificationStep` - Шаг верификации телефона
- `SkillsStep` - Шаг выбора навыков
- `LocationStep` - Шаг выбора зоны обслуживания
- `DocumentsStep` - Шаг загрузки документов
- `TermsStep` - Шаг принятия условий
- `ProgressIndicator` - Индикатор прогресса

## Валидация

Каждый шаг имеет встроенную валидацию через React Hook Form:

- **Email**: Проверка формата email
- **Phone**: Проверка формата телефона (10+ цифр)
- **Required Fields**: Обязательные поля помечены *
- **File Upload**: Минимум 1 сертификат обязателен
- **Terms**: Оба чекбокса должны быть приняты

## OTP Verification

Шаг верификации включает:
- 6-значный OTP код
- Автоматический фокус на следующее поле
- Таймер повторной отправки (60 секунд)
- Автоматическая верификация при вводе всех цифр

## Map Integration

Для карты используется `react-native-maps`:
- Выбор центра зоны обслуживания
- Визуализация радиуса обслуживания
- Получение текущего местоположения
- Маркер центра зоны

## File Upload

Поддержка загрузки:
- **Certificates**: PDF и изображения (обязательно)
- **Portfolio**: Изображения работ (опционально)
- **ID Document**: PDF или изображение (опционально)

Используется:
- `expo-document-picker` для документов
- `expo-image-picker` для изображений

## Типы данных

```typescript
interface RegistrationFormData {
  personalInfo: PersonalInfo;
  phoneVerified: boolean;
  skills: SkillsInfo;
  location: LocationInfo;
  documents: DocumentsInfo;
  termsAccepted: boolean;
}
```

## Кастомизация

Все стили используют Tailwind CSS через NativeWind. Можно легко изменить:
- Цвета кнопок и полей
- Размеры и отступы
- Шрифты и тексты

## Примечания

1. **Permissions**: Для карты и загрузки файлов требуются разрешения:
   - Location (для карты)
   - Media Library (для изображений)

2. **OTP Integration**: В реальном приложении нужно интегрировать с SMS-сервисом (Twilio, Firebase и т.д.)

3. **File Upload**: Файлы должны быть загружены на сервер перед завершением регистрации

4. **Map**: Для работы карты нужен API ключ Google Maps или Apple Maps (в зависимости от платформы)









