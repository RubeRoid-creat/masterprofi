# Структура проекта CRM системы MasterProfi

## 📁 Backend Structure (NestJS)

```
backend/src/
├── crm-customers/          # Модуль управления клиентами
│   ├── crm-customers.module.ts
│   ├── crm-customers.controller.ts
│   ├── crm-customers.service.ts
│   ├── dto/
│   │   ├── create-customer.dto.ts
│   │   └── update-customer.dto.ts
│   └── entities/
│       ├── customer.entity.ts
│       ├── customer-contact.entity.ts
│       ├── customer-address.entity.ts
│       ├── customer-note.entity.ts
│       └── customer-document.entity.ts
│
├── crm-orders/             # Модуль управления заказами (расширенный)
│   ├── crm-orders.module.ts
│   ├── crm-orders.controller.ts
│   ├── crm-orders.service.ts
│   └── entities/
│       └── order-status-history.entity.ts
│
├── crm-masters/            # Модуль управления мастерами
│   ├── crm-masters.module.ts
│   ├── crm-masters.controller.ts
│   ├── crm-masters.service.ts
│   └── entities/
│       ├── master.entity.ts
│       ├── master-skill.entity.ts
│       └── master-certificate.entity.ts
│
├── crm-finance/            # Модуль финансового управления
│   ├── crm-finance.module.ts
│   ├── crm-finance.controller.ts
│   ├── crm-finance.service.ts
│   └── entities/
│       ├── transaction.entity.ts
│       ├── payout-request.entity.ts
│       └── invoice.entity.ts
│
├── crm-analytics/          # Модуль аналитики (TODO)
│   ├── crm-analytics.module.ts
│   ├── crm-analytics.controller.ts
│   └── crm-analytics.service.ts
│
└── shared/                 # Общие компоненты
    ├── components/
    │   ├── data-table/     # Переиспользуемая таблица данных
    │   ├── form-builder/   # Конструктор форм
    │   └── notification/   # Система уведомлений
    └── utils/
```

## 📁 Frontend Structure (React)

```
web-admin/src/
├── modules/
│   ├── customers/           # Модуль управления клиентами
│   │   ├── CustomersPage.tsx
│   │   ├── CustomerProfile.tsx
│   │   ├── CustomerList.tsx
│   │   └── components/
│   │       ├── CustomerCard.tsx
│   │       ├── CustomerForm.tsx
│   │       └── CustomerTimeline.tsx
│   │
│   ├── orders/             # Модуль управления заказами
│   │   ├── OrdersPage.tsx
│   │   ├── OrderDetails.tsx
│   │   ├── KanbanBoard.tsx  # Kanban доска
│   │   └── components/
│   │       ├── OrderCard.tsx
│   │       ├── OrderTimeline.tsx
│   │       └── OrderChat.tsx
│   │
│   ├── masters/            # Модуль управления мастерами
│   │   ├── MastersPage.tsx
│   │   ├── MasterProfile.tsx
│   │   ├── MasterDirectory.tsx
│   │   └── components/
│   │       ├── MasterCard.tsx
│   │       ├── MasterPerformance.tsx
│   │       └── MasterSchedule.tsx
│   │
│   ├── finance/             # Модуль финансов
│   │   ├── FinanceDashboard.tsx
│   │   ├── CommissionCalculator.tsx
│   │   └── components/
│   │       ├── RevenueChart.tsx
│   │       ├── ExpenseTracker.tsx
│   │       └── PayoutManager.tsx
│   │
│   └── analytics/           # Модуль аналитики
│       ├── AnalyticsDashboard.tsx
│       ├── ReportBuilder.tsx
│       └── components/
│           ├── CustomChart.tsx
│           └── KPIWidget.tsx
│
├── components/
│   ├── shared/             # Общие компоненты
│   │   ├── DataTable/      # Переиспользуемая таблица
│   │   │   ├── DataTable.tsx
│   │   │   ├── TableHeader.tsx
│   │   │   ├── TableRow.tsx
│   │   │   └── TablePagination.tsx
│   │   │
│   │   ├── FormBuilder/    # Конструктор форм
│   │   │   ├── FormBuilder.tsx
│   │   │   ├── FormField.tsx
│   │   │   └── FormWizard.tsx
│   │   │
│   │   └── Notification/    # Система уведомлений
│   │       ├── NotificationCenter.tsx
│   │       ├── NotificationToast.tsx
│   │       └── NotificationPreferences.tsx
│   │
│   └── ...                 # Существующие компоненты
│
├── services/
│   ├── api/
│   │   ├── customersApi.ts
│   │   ├── ordersApi.ts
│   │   ├── mastersApi.ts
│   │   ├── financeApi.ts
│   │   └── analyticsApi.ts
│   └── ...                 # Существующие сервисы
│
└── store/
    ├── slices/
    │   ├── customersSlice.ts
    │   ├── ordersSlice.ts
    │   ├── mastersSlice.ts
    │   └── financeSlice.ts
    └── ...                 # Существующие слайсы
```

## 🔌 API Endpoints

### Customers API
```
GET    /api/v1/customers
POST   /api/v1/customers
GET    /api/v1/customers/:id
PUT    /api/v1/customers/:id
DELETE /api/v1/customers/:id
POST   /api/v1/customers/:id/orders
GET    /api/v1/customers/:id/history
```

### Orders API
```
GET    /api/v1/orders
POST   /api/v1/orders
GET    /api/v1/orders/:id
PUT    /api/v1/orders/:id/status
POST   /api/v1/orders/:id/assign
GET    /api/v1/orders/:id/chat
```

### Masters API
```
GET    /api/v1/masters
POST   /api/v1/masters
GET    /api/v1/masters/:id
GET    /api/v1/masters/:id/performance
PUT    /api/v1/masters/:id/availability
```

### Finance API
```
GET    /api/v1/finance/overview
GET    /api/v1/finance/commissions
POST   /api/v1/finance/payouts
GET    /api/v1/finance/reports
```

## 📊 Database Tables

### CRM Customers
- `crm_customers` - Основная информация о клиентах
- `crm_customer_contacts` - Контакты клиентов
- `crm_customer_addresses` - Адреса клиентов
- `crm_customer_notes` - Заметки о клиентах
- `crm_customer_documents` - Документы клиентов

### CRM Orders
- `crm_order_status_history` - История изменения статусов заказов

### CRM Masters
- `crm_masters` - Информация о мастерах
- `crm_master_skills` - Навыки мастеров
- `crm_master_certificates` - Сертификаты мастеров

### CRM Finance
- `crm_transactions` - Транзакции
- `crm_payout_requests` - Запросы на выплату
- `crm_invoices` - Счета

## 🚀 Следующие шаги

1. ✅ Создать структуру backend модулей
2. ⏳ Создать миграции для новых таблиц
3. ⏳ Создать frontend компоненты
4. ⏳ Реализовать общие компоненты (DataTable, FormBuilder)
5. ⏳ Интегрировать модули в app.module.ts
6. ⏳ Добавить API endpoints в frontend services





