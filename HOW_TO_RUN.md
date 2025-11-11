# 🚀 Как запустить MasterProfi

## Шаг 1: Создайте базу данных PostgreSQL

Откройте **pgAdmin** (или любой другой PostgreSQL клиент) и выполните:

```sql
CREATE DATABASE masterprofi;
```

Если база уже существует, пропустите этот шаг.

## Шаг 2: Создайте .env файл

В папке `backend` создайте файл `.env` с содержимым:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=masterprofi

JWT_SECRET=dev-secret-key-123456789
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=dev-refresh-secret-987654321

PORT=3000
NODE_ENV=development

REDIS_URL=redis://localhost:6379
FRONTEND_URL=http://localhost:5173
```

**Примечание:** Замените `postgres/postgres` на свои учетные данные PostgreSQL, если они отличаются.

## Шаг 3: Запустите сервер

Откройте новое окно терминала или PowerShell:

```bash
cd "Z:\App RBT\backend"
npm run start:dev
```

Подождите 10-15 секунд пока сервер запустится.

## Шаг 4: Проверьте работу

Откройте в браузере:
- http://localhost:3000/api - должно показать `{"status":"OK",...}`
- http://localhost:3000/api/docs - Swagger UI с документацией API

## ✅ Готово!

Теперь можете тестировать API через Swagger UI!

## 🐛 Проблемы?

### "Could not connect to PostgreSQL"

**Решение:** Проверьте, что PostgreSQL запущен:
```powershell
Get-Service PostgreSQL
```

Если не запущен:
```powershell
Start-Service PostgreSQL
```

### "Role 'masterprofi' does not exist"

**Решение:** Используйте существующего пользователя `postgres` в `.env`:
```
DB_USERNAME=postgres
DB_PASSWORD=postgres
```

### Порт 3000 занят

**Решение:** Измените порт в `.env`:
```
PORT=3001
```

---

**Удачи!** 🎉

