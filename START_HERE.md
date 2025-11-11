# 🚀 MasterProfi - Быстрый старт

## ✅ Что уже готово

Проект MasterProfi полностью настроен и готов к запуску:

### Backend (NestJS)
- ✅ Микросервисная архитектура
- ✅ JWT аутентификация
- ✅ REST API с Swagger документацией
- ✅ TypeORM + PostgreSQL
- ✅ Socket.io для real-time
- ✅ MLM система заготовка

### Структура модулей
- `auth/` - Регистрация и авторизация
- `users/` - Управление пользователями
- `orders/` - Заказы и обработка
- `payments/` - Платежи
- `mlm/` - MLM система комиссий
- `notification/` - Real-time уведомления

## ⚙️ Требования для запуска

### Вариант 1: Docker (РЕКОМЕНДУЕТСЯ)

```bash
# 1. Запустить PostgreSQL и Redis
docker-compose up -d postgres redis

# 2. Установить зависимости
cd backend
npm install

# 3. Запустить backend
npm run start:dev
```

### Вариант 2: Локальный PostgreSQL

```bash
# 1. Установить PostgreSQL
# Windows: postgresql.org/download/windows
# macOS: brew install postgresql@14
# Linux: sudo apt install postgresql

# 2. Создать базу данных
psql -U postgres
CREATE DATABASE masterprofi;
CREATE USER masterprofi WITH PASSWORD 'masterprofi_pass';
GRANT ALL PRIVILEGES ON DATABASE masterprofi TO masterprofi;
\q

# 3. Настроить .env
cd backend
cp .env.example .env
# Отредактировать .env если нужно

# 4. Установить зависимости
npm install

# 5. Запустить
npm run start:dev
```

## 📝 Проверка работы

После запуска откройте в браузере:

- **Backend API**: http://localhost:3000/api
- **Swagger Docs**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/api (должен вернуть JSON с status: "OK")

## 🧪 Тестирование API

### Регистрация
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

### Авторизация
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## 📚 Документация

См. [docs/SETUP.md](docs/SETUP.md) для подробной документации.

## 🐛 Проблемы?

### База не подключается
```bash
# Проверить PostgreSQL
docker ps
# или
pg_isready -h localhost

# Проверить .env файл
cat backend/.env
```

### Порт занят
```bash
# Изменить PORT в backend/.env
PORT=3001
```

### Зависимости не установлены
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

## 🎯 Следующие шаги

1. ✅ Запустить backend
2. ⏳ Создать React Admin панель
3. ⏳ Создать React Native приложение
4. ⏳ Реализовать MLM расчеты
5. ⏳ Добавить платежи

---

**Готово к разработке!** 🎉

