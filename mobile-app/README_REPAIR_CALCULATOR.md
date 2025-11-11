# Repair Cost Calculator

Интерактивный калькулятор стоимости ремонта с полным функционалом расчета, одобрения и генерации PDF.

## Компоненты

### Главный компонент: `RepairCalculator`

Многошаговый процесс создания предложения:

1. **Parts Selection** - Выбор запчастей из базы данных
2. **Labor Time Estimation** - Оценка времени работы
3. **Review & Calculate** - Просмотр и расчет итоговой стоимости
4. **Client Approval** - Рабочий процесс одобрения клиентом

## Функциональность

✅ **Parts Selection from Database**
- Поиск по названию и артикулу
- Фильтрация по категориям
- Информация о наличии
- Гарантия и сроки доставки
- Совместимость с моделями

✅ **Labor Time Estimation**
- Быстрый выбор типичного времени
- Ручной ввод часов и минут
- Выбор категории работ (Diagnosis, Repair, Installation, Maintenance)
- Разные ставки для разных категорий
- Описание выполняемых работ

✅ **Service Fee Calculation**
- Настраиваемая плата за вызов
- Стандартная стоимость сервиса

✅ **Tax Computation**
- Автоматический расчет НДС
- Настраиваемая ставка налога (по умолчанию 20%)
- Отображение суммы до и после налогов

✅ **Discount Application**
- Процентная скидка (5%, 10%, 15%, 20%)
- Фиксированная скидка
- Указание причины скидки
- Ограничение максимальной суммы

✅ **Final Quote Generation**
- Полная разбивка стоимости
- Итоговая сумма с учетом всех факторов
- Номер предложения
- Срок действия (7 дней)

✅ **Client Approval Workflow**
- Выбор способа оплаты (Карта, Наличные, Онлайн)
- Примечания клиента
- Статус одобрения (Approved/Rejected)
- Подтверждение перед отправкой

✅ **PDF Quote Generation**
- Генерация PDF предложения (заглушка)
- Готовность к интеграции с библиотеками PDF

## Использование

### Базовое использование

```tsx
import { RepairCalculator } from './src/components/orderDetails/RepairCalculator';

<RepairCalculator
  orderId="order-123"
  applianceType="washing-machine"
  hourlyRate={1500}
  taxRate={20}
  onQuoteGenerated={(quote) => {
    console.log('Quote generated:', quote);
  }}
  onQuoteApproved={(quote) => {
    console.log('Quote approved:', quote);
  }}
/>
```

### Интеграция в OrderDetailsScreen

```tsx
import { RepairCalculator } from './src/components/orderDetails/RepairCalculator';

// В OrderDetailsScreen
<RepairCalculator
  orderId={order.id}
  applianceType={order.applianceType}
  initialParts={order.parts}
  onQuoteGenerated={(quote) => {
    // Сохранить предложение
    updateOrder({ quoteId: quote.id });
  }}
  onQuoteApproved={(quote) => {
    // Отправить уведомление клиенту
    notifyClient(quote);
  }}
/>
```

## Типы данных

### QuoteBreakdown

```typescript
interface QuoteBreakdown {
  parts: PartItem[];
  partsTotal: number;
  labor: LaborEstimate;
  laborTotal: number;
  serviceFee: number;
  subtotal: number;
  discount?: Discount;
  discountAmount: number;
  tax: TaxCalculation;
  total: number;
  currency: string;
}
```

### RepairQuote

```typescript
interface RepairQuote {
  id: string;
  orderId: string;
  quoteNumber: string;
  createdAt: string;
  expiresAt: string;
  breakdown: QuoteBreakdown;
  notes?: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
  approvedAt?: string;
  approvedBy?: string;
  pdfUrl?: string;
}
```

## Компоненты калькулятора

### PartsSelector
- Выбор запчастей из базы данных
- Поиск и фильтрация
- Управление количеством
- Просмотр совместимости

### LaborTimeEstimator
- Оценка времени работы
- Категории работ
- Ставки за час
- Быстрый выбор времени

### ServiceFeeCalculator
- Настройка платы за вызов

### TaxCalculator
- Расчет НДС
- Отображение суммы с налогами

### DiscountApplicator
- Применение скидок
- Процентные и фиксированные
- Причины скидок

### QuoteSummary
- Полная разбивка стоимости
- Детали по каждому пункту

### ClientApprovalWorkflow
- Рабочий процесс одобрения
- Выбор способа оплаты
- Примечания клиента

### PDFGenerator
- Генерация PDF (заглушка)
- Готовность к интеграции

## Расчет стоимости

### Порядок расчета:

1. **Parts Total** = Σ(part.price × part.quantity)
2. **Labor Total** = (hours + minutes/60) × hourlyRate
3. **Subtotal** = Parts Total + Labor Total + Service Fee
4. **Discount** = Применение скидки к Subtotal
5. **After Discount** = Subtotal - Discount Amount
6. **Tax Amount** = After Discount × (taxRate / 100)
7. **Final Total** = After Discount + Tax Amount

## PDF Generation

Для генерации PDF в продакшене потребуется одна из библиотек:

- `react-native-pdf-lib` - Генерация PDF на устройстве
- Backend service - Генерация на сервере
- `react-native-view-shot` + `react-native-html-to-pdf` - Альтернативный подход

Текущая реализация `PDFGenerator` является заглушкой и требует интеграции.

## База данных запчастей

В текущей реализации используется моковая база данных. Для продакшена замените:

```typescript
// В PartsSelector.tsx
const loadParts = async () => {
  // Замените на реальный API вызов
  const response = await fetch(`/api/parts?appliance=${applianceType}`);
  const parts = await response.json();
  setParts(parts);
};
```

## Интеграция с API

### Endpoints для интеграции:

```typescript
// Получить запчасти
GET /api/parts?appliance=washing-machine&category=Electrical

// Создать предложение
POST /api/quotes
Body: RepairQuote

// Одобрить предложение
POST /api/quotes/:id/approve
Body: ClientApproval

// Получить PDF
GET /api/quotes/:id/pdf
```

## Стилизация

Все компоненты используют Tailwind CSS через NativeWind для стилизации.

## Accessibility

- Полная поддержка screen readers
- Accessibility labels для всех элементов
- Keyboard navigation support








