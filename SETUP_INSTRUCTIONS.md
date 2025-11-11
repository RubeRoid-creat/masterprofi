# MasterProfi - Инструкция по запуску

## ✅ Проект полностью настроен!

Backend MasterProfi готов к запуску. Для работы нужна только база данных PostgreSQL.

## 🚀 Запуск проекта

### Шаг 1: Убедитесь, что PostgreSQL запущен

Проверьте в службах Windows или через pgAdmin.

### Шаг 2: Создайте базу данных

Откройте **pgAdmin** или любой PostgreSQL клиент и выполните:

```sql
CREATE DATABASE masterprofi;
CREATE USER masterprofi WITH PASSWORD 'masterprofi_pass';
GRANT ALL PRIVILEGES ON DATABASE masterprofi TO masterprofi;
```

**ИЛИ** используйте существующий пользователь `postgres` (пароль: `postgres`)

### Шаг 3: Запустите Backend

```bash
cd backend
npm run start:dev
```

Сервер запустится на: http://localhost:3000

### Шаг 4: Откройте Swagger документацию

http://localhost:3000/api/docs

## 🧪 Тестирование API

### 1. Регистрация пользователя

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### 2. Вход в систему

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Вы получите `access_token` для авторизации.

### 3. Получить список пользователей

```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 📁 Структура проекта

```
MasterProfi/
├── backend/                    # NestJS API
│   ├── src/
│   │   ├── auth/              # Аутентификация
│   │   ├── users/             # Пользователи
│   │   ├── orders/            # Заказы
│   │   ├── payments/          # Платежи
│   │   ├── mlm/               # MLM система
│   │   ├── notification/      # Real-time
│   │   └── main.ts            # Entry point
│   └── package.json
├── docs/                       # Документация
├── README.md                   # Описание проекта
└── docker-compose.yml         # Docker конфигурация
```

## 🔧 Настройка

Файл `.env` создается автоматически при первом запуске или скопируйте из `env.example`.

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=masterprofi
JWT_SECRET=your-secret-key
```

## ✅ Что уже работает

- ✅ NestJS Backend
- ✅ JWT Авторизация
- ✅ TypeORM + PostgreSQL
- ✅ Swagger API Docs
- ✅ Socket.io Real-time
- ✅ CRUD для Users, Orders
- ✅ Docker Compose
- ✅ MLM структура

## 🔄 Следующие шаги

1. Запустить PostgreSQL
2. Запустить Backend
3. Тестировать через Swagger
4. Создать Web Admin (React)
5. Создать Mobile App (React Native)

---

**Проект готов! Просто запустите PostgreSQL и backend!** 🎉

