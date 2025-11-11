# ⚡ Быстрый старт MasterProfi

## 1️⃣ Запустите PostgreSQL

### Windows (Docker)
```bash
docker-compose up -d postgres
```

### macOS
```bash
brew install postgresql@14
brew services start postgresql@14
```

### Linux
```bash
sudo apt install postgresql
sudo systemctl start postgresql
```

## 2️⃣ Установите зависимости

```bash
cd backend
npm install
```

## 3️⃣ Настройте .env

```bash
cp .env.example .env
```

Или создайте `.env` с:
```
DATABASE_URL=postgresql://masterprofi:masterprofi_pass@localhost:5432/masterprofi
JWT_SECRET=your-secret-key
```

## 4️⃣ Запустите сервер

```bash
npm run start:dev
```

## 5️⃣ Откройте в браузере

- API: http://localhost:3000/api
- Swagger: http://localhost:3000/api/docs

## 🎉 Готово!

Начните тестировать API через Swagger документацию!

