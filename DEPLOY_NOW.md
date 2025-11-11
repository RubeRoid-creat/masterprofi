# 🚀 Быстрый запуск проекта на сервере

## IP сервера: 212.74.227.208

## Шаг 1: Загрузка проекта на сервер

### Вариант A: Через SCP (с вашей локальной машины)

```powershell
# В PowerShell на вашей машине
scp -r "Z:\App RBT\*" deploy@212.74.227.208:~/masterprofi/
```

### Вариант B: Через Git (если есть репозиторий)

```bash
# На сервере
cd ~
git clone <URL_вашего_репозитория> masterprofi
cd masterprofi
```

## Шаг 2: Подключение к серверу

```powershell
ssh deploy@212.74.227.208
# или
ssh root@212.74.227.208
```

## Шаг 3: Создание .env файла

```bash
cd ~/masterprofi
nano .env
```

**Вставьте следующее содержимое (замените пароли на безопасные!):**

```env
# Database
POSTGRES_USER=masterprofi
POSTGRES_PASSWORD=ИЗМЕНИТЕ_НА_СИЛЬНЫЙ_ПАРОЛЬ_123
POSTGRES_DB=masterprofi

# JWT
JWT_SECRET=ИЗМЕНИТЕ_НА_СИЛЬНЫЙ_СЕКРЕТ_JWT_МИНИМУМ_32_СИМВОЛА
JWT_REFRESH_SECRET=ИЗМЕНИТЕ_НА_СИЛЬНЫЙ_СЕКРЕТ_REFRESH_МИНИМУМ_32_СИМВОЛА
JWT_EXPIRES_IN=1h

# YooKassa (опционально, можно оставить пустым)
YOOKASSA_SHOP_ID=
YOOKASSA_SECRET_KEY=

# Frontend API URL
VITE_API_URL=http://212.74.227.208:3000/api
```

**Сохранение в nano:** `Ctrl+O`, `Enter`, `Ctrl+X`

## Шаг 4: Генерация безопасных паролей (опционально)

```bash
# Генерация случайных паролей
openssl rand -base64 32  # Для POSTGRES_PASSWORD
openssl rand -base64 32  # Для JWT_SECRET
openssl rand -base64 32  # Для JWT_REFRESH_SECRET
```

## Шаг 5: Запуск проекта

```bash
cd ~/masterprofi

# Сборка Docker образов
docker compose -f docker-compose.prod.yml build

# Запуск контейнеров
docker compose -f docker-compose.prod.yml up -d

# Проверка статуса
docker compose -f docker-compose.prod.yml ps
```

## Шаг 6: Применение миграций БД

```bash
# Дождитесь запуска postgres (около 10-15 секунд)
sleep 15

# Применение миграций
docker compose -f docker-compose.prod.yml exec backend npm run migration:run
```

## Шаг 7: Проверка работы

```bash
# Просмотр логов
docker compose -f docker-compose.prod.yml logs -f

# Проверка доступности
curl -I http://localhost:8080  # Web-admin
curl -I http://localhost:3000  # Backend API
```

## 🌐 Доступ к приложению

Откройте в браузере:
- **Web-admin:** http://212.74.227.208:8080
- **API:** http://212.74.227.208:3000/api

## 🔧 Полезные команды

### Просмотр логов
```bash
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f web-admin
docker compose -f docker-compose.prod.yml logs -f postgres
```

### Перезапуск сервисов
```bash
docker compose -f docker-compose.prod.yml restart
docker compose -f docker-compose.prod.yml restart backend
```

### Остановка
```bash
docker compose -f docker-compose.prod.yml down
```

### Остановка с удалением данных (ОСТОРОЖНО!)
```bash
docker compose -f docker-compose.prod.yml down -v
```

### Обновление проекта
```bash
cd ~/masterprofi
git pull  # или загрузите новые файлы
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml exec backend npm run migration:run
```

## 🚨 Решение проблем

### Контейнеры не запускаются
```bash
# Проверьте логи
docker compose -f docker-compose.prod.yml logs

# Проверьте статус
docker compose -f docker-compose.prod.yml ps -a

# Пересоздайте контейнеры
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d
```

### Ошибки подключения к БД
```bash
# Проверьте что postgres запущен
docker compose -f docker-compose.prod.yml ps postgres

# Проверьте логи postgres
docker compose -f docker-compose.prod.yml logs postgres

# Проверьте .env файл
cat .env | grep POSTGRES
```

### Проблемы с миграциями
```bash
# Запустите миграции вручную
docker compose -f docker-compose.prod.yml exec backend npm run migration:run

# Или через TypeORM CLI
docker compose -f docker-compose.prod.yml exec backend \
  node node_modules/typeorm/cli.js migration:run -d ormconfig.ts
```

### Проверка портов
```bash
# Проверка что порты открыты
sudo ss -tulpn | grep -E ':80|:443|:3000|:5432|:8080'

# Если порты закрыты, откройте в firewall
sudo ufw allow 8080/tcp
sudo ufw allow 3000/tcp
```

## ✅ Чеклист готовности

- [ ] Проект загружен на сервер
- [ ] Создан .env файл с безопасными паролями
- [ ] Docker образы собраны
- [ ] Контейнеры запущены
- [ ] Миграции применены
- [ ] Web-admin доступен по http://212.74.227.208:8080
- [ ] API доступен по http://212.74.227.208:3000/api

## 🎯 Следующие шаги

1. Настройте домен (если есть)
2. Установите SSL сертификат (Let's Encrypt)
3. Настройте Nginx как reverse proxy
4. Создайте первого администратора через API
5. Настройте автоматические бэкапы БД

