# 🚀 Следующие шаги после загрузки проекта на сервер

## ✅ Что уже сделано:
- ✅ Проект загружен на сервер
- ✅ Docker установлен и работает
- ✅ Backend запущен и работает
- ✅ Web-admin запущен и работает
- ✅ CORS настроен
- ✅ База данных подключена

## 📋 Что нужно сделать сейчас:

### 1. Применить миграции для таблиц referrals и bonuses

На сервере выполните:

```bash
cd /opt/masterprofi

# Обновите проект (если еще не обновляли)
git pull

# Пересоберите backend (чтобы включить новые миграции)
docker compose -f docker-compose.prod.yml build backend
docker compose -f docker-compose.prod.yml restart backend

# Примените миграции
docker compose -f docker-compose.prod.yml exec backend npm run migration:run
```

Если миграции не применяются, создайте таблицы вручную:

```bash
docker compose -f docker-compose.prod.yml exec postgres psql -U masterprofi -d masterprofi << 'EOF'
CREATE TABLE IF NOT EXISTS "referrals" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "referrerId" uuid NOT NULL,
  "referredId" uuid NOT NULL,
  "totalEarned" numeric(10,2) NOT NULL DEFAULT 0,
  "ordersCount" integer NOT NULL DEFAULT 0,
  "isActive" boolean NOT NULL DEFAULT true,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "FK_referrals_referrer" FOREIGN KEY ("referrerId") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "FK_referrals_referred" FOREIGN KEY ("referredId") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "UQ_referrals_pair" UNIQUE ("referrerId", "referredId")
);

CREATE TABLE IF NOT EXISTS "bonuses" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" uuid NOT NULL,
  "amount" numeric(10,2) NOT NULL,
  "type" varchar NOT NULL,
  "status" varchar NOT NULL DEFAULT 'pending',
  "orderId" uuid,
  "referralId" varchar,
  "description" text,
  "level" integer,
  "commissionRate" numeric(5,2),
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "FK_bonuses_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "FK_bonuses_order" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL
);
EOF
```

### 2. Создать первого администратора

#### Вариант A: Через API

```bash
curl -X POST http://212.74.227.208:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@masterprofi.ru",
    "password": "SecurePassword123!",
    "role": "admin",
    "firstName": "Admin",
    "lastName": "User"
  }'
```

#### Вариант B: Через базу данных

```bash
docker compose -f docker-compose.prod.yml exec postgres psql -U masterprofi -d masterprofi
```

Затем в psql:

```sql
-- Создайте пользователя (пароль нужно захешировать через bcrypt)
-- Или используйте готовый скрипт для создания админа
INSERT INTO users (id, email, password, role, "firstName", "lastName", "createdAt", "updatedAt")
VALUES (
  uuid_generate_v4(),
  'admin@masterprofi.ru',
  '$2b$10$YourHashedPasswordHere', -- Замените на реальный bcrypt hash
  'admin',
  'Admin',
  'User',
  now(),
  now()
);
```

### 3. Проверить работу приложения

1. Откройте в браузере: http://212.74.227.208:8080
2. Войдите с учетными данными администратора
3. Проверьте все разделы:
   - Dashboard
   - Orders
   - Users
   - MLM
   - Payments
   - Reports

### 4. Настроить домен (опционально, но рекомендуется)

Если у вас есть домен:

1. Настройте DNS записи:
   - A запись: `yourdomain.com` → `212.74.227.208`
   - A запись: `www.yourdomain.com` → `212.74.227.208`

2. Установите Nginx как reverse proxy:

```bash
sudo apt update
sudo apt -y install nginx certbot python3-certbot-nginx

# Создайте конфигурацию Nginx
sudo nano /etc/nginx/sites-available/masterprofi
```

Вставьте:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/masterprofi /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Установите SSL сертификат
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

3. Обновите VITE_API_URL в .env:

```bash
nano .env
```

Измените:
```env
VITE_API_URL=https://yourdomain.com/api
FRONTEND_URL=https://yourdomain.com
```

Пересоберите web-admin:
```bash
docker compose -f docker-compose.prod.yml build web-admin
docker compose -f docker-compose.prod.yml up -d web-admin
```

### 5. Настроить автоматические бэкапы БД

Создайте скрипт для бэкапов:

```bash
sudo nano /opt/masterprofi/backup-db.sh
```

Вставьте:

```bash
#!/bin/bash
BACKUP_DIR="/opt/masterprofi/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

docker compose -f /opt/masterprofi/docker-compose.prod.yml exec -T postgres \
  pg_dump -U masterprofi masterprofi > $BACKUP_DIR/backup_$DATE.sql

# Удаляем бэкапы старше 7 дней
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

```bash
chmod +x /opt/masterprofi/backup-db.sh

# Добавьте в crontab (бэкап каждый день в 2:00)
sudo crontab -e
```

Добавьте строку:
```
0 2 * * * /opt/masterprofi/backup-db.sh
```

### 6. Настроить мониторинг (опционально)

Можно настроить:
- Prometheus + Grafana для метрик
- Uptime monitoring (UptimeRobot, Pingdom)
- Логирование в централизованную систему

### 7. Ужесточить безопасность

```bash
# Отключить вход root по SSH
sudo nano /etc/ssh/sshd_config
# Найдите: PermitRootLogin yes
# Измените на: PermitRootLogin no
sudo systemctl restart ssh

# Настроить fail2ban
sudo apt -y install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Обновить систему
sudo apt update && sudo apt -y upgrade
```

## 🔧 Полезные команды для управления:

```bash
# Просмотр логов
docker compose -f docker-compose.prod.yml logs -f

# Перезапуск сервиса
docker compose -f docker-compose.prod.yml restart backend

# Обновление проекта
cd /opt/masterprofi
git pull
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml exec backend npm run migration:run

# Проверка статуса
docker compose -f docker-compose.prod.yml ps

# Остановка всех сервисов
docker compose -f docker-compose.prod.yml down

# Запуск всех сервисов
docker compose -f docker-compose.prod.yml up -d
```

## ✅ Чеклист готовности:

- [ ] Миграции применены (таблицы referrals и bonuses созданы)
- [ ] Первый администратор создан
- [ ] Web-admin работает и доступен
- [ ] Домен настроен (опционально)
- [ ] SSL сертификат установлен (опционально)
- [ ] Бэкапы настроены
- [ ] Безопасность усилена

## 🎯 Приоритетные задачи:

1. **СРОЧНО**: Применить миграции для таблиц referrals и bonuses
2. **ВАЖНО**: Создать первого администратора
3. **ВАЖНО**: Протестировать мобильное приложение
4. **РЕКОМЕНДУЕТСЯ**: Настроить домен и SSL
5. **РЕКОМЕНДУЕТСЯ**: Настроить автоматические бэкапы

