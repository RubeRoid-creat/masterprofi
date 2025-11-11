# Развертывание MasterProfi на Debian

## Системные требования
- Debian 11 (Bullseye) или Debian 12 (Bookworm)
- Минимум: 2 vCPU, 4 GB RAM, 40 GB SSD
- Рекомендуется: 4 vCPU, 8 GB RAM, 100 GB SSD

## Быстрая установка (автоматический скрипт)

### 1. Подключитесь к серверу
```bash
ssh root@80.249.151.59
```

### 2. Загрузите и запустите скрипт установки
```bash
# Загрузите скрипт на сервер (или создайте его вручную)
wget https://raw.githubusercontent.com/your-repo/masterprofi/main/deploy-debian.sh
# Или скопируйте содержимое deploy-debian.sh в файл на сервере

chmod +x deploy-debian.sh
sudo ./deploy-debian.sh
```

## Ручная установка (пошагово)

### Шаг 1: Обновление системы
```bash
sudo apt update && sudo apt -y upgrade
```

### Шаг 2: Установка базовых пакетов
```bash
sudo apt -y install \
  ca-certificates \
  curl \
  gnupg \
  git \
  ufw \
  nano \
  htop \
  wget \
  software-properties-common \
  apt-transport-https
```

### Шаг 3: Установка Docker
```bash
# Добавление GPG ключа Docker
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Добавление репозитория Docker
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Установка Docker
sudo apt update
sudo apt -y install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### Шаг 4: Создание пользователя deploy
```bash
sudo useradd -m -s /bin/bash deploy
sudo usermod -aG sudo deploy
sudo usermod -aG docker deploy
```

### Шаг 5: Настройка SSH ключей (рекомендуется)
```bash
# На вашей локальной машине скопируйте публичный ключ
ssh-copy-id deploy@80.249.151.63

# Или вручную на сервере:
sudo mkdir -p /home/deploy/.ssh
sudo nano /home/deploy/.ssh/authorized_keys
# Вставьте ваш публичный ключ SSH
sudo chmod 700 /home/deploy/.ssh
sudo chmod 600 /home/deploy/.ssh/authorized_keys
sudo chown -R deploy:deploy /home/deploy/.ssh
```

### Шаг 6: Настройка firewall
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
sudo ufw status verbose
```

### Шаг 7: Загрузка проекта
```bash
# Переключитесь на пользователя deploy
sudo su - deploy

# Создайте директорию проекта
mkdir -p ~/masterprofi
cd ~/masterprofi

# Склонируйте проект (замените на ваш репозиторий)
git clone <URL_вашего_репозитория> .

# Или загрузите через SCP/rsync с локальной машины
```

### Шаг 8: Создание .env файла
```bash
cd ~/masterprofi
nano .env
```

Содержимое `.env`:
```env
POSTGRES_USER=masterprofi
POSTGRES_PASSWORD=ИЗМЕНИТЕ_НА_СИЛЬНЫЙ_ПАРОЛЬ
POSTGRES_DB=masterprofi
JWT_SECRET=ИЗМЕНИТЕ_НА_СИЛЬНЫЙ_СЕКРЕТ
JWT_REFRESH_SECRET=ИЗМЕНИТЕ_НА_СИЛЬНЫЙ_СЕКРЕТ_REFRESH
JWT_EXPIRES_IN=1h
YOOKASSA_SHOP_ID=
YOOKASSA_SECRET_KEY=
VITE_API_URL=https://ваш-домен.ru/api
```

**Важно:** Замените все значения на безопасные случайные строки!

### Шаг 9: Сборка и запуск
```bash
cd ~/masterprofi

# Сборка образов
docker compose -f docker-compose.prod.yml build

# Запуск контейнеров
docker compose -f docker-compose.prod.yml up -d

# Проверка статуса
docker compose -f docker-compose.prod.yml ps
```

### Шаг 10: Применение миграций БД
```bash
docker compose -f docker-compose.prod.yml exec backend npm run migration:run
```

### Шаг 11: Проверка работы
```bash
# Проверка логов
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f web-admin

# Проверка доступности (в другом терминале)
curl -I http://localhost:8080  # Web-admin
curl -I http://localhost:3000  # Backend API
```

## Настройка Nginx для продакшн (опционально)

### Установка Nginx
```bash
sudo apt -y install nginx certbot python3-certbot-nginx
```

### Создание конфигурации
```bash
sudo nano /etc/nginx/sites-available/masterprofi
```

Содержимое:
```nginx
server {
    listen 80;
    server_name ваш-домен.ru www.ваш-домен.ru;

    # Редирект на HTTPS (после получения сертификата)
    # return 301 https://$server_name$request_uri;

    # Временная конфигурация для получения сертификата
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket поддержка
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### Активация конфигурации
```bash
sudo ln -s /etc/nginx/sites-available/masterprofi /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Получение SSL сертификата
```bash
sudo certbot --nginx -d ваш-домен.ru -d www.ваш-домен.ru
```

## Управление сервисом

### Остановка
```bash
cd ~/masterprofi
docker compose -f docker-compose.prod.yml down
```

### Перезапуск
```bash
docker compose -f docker-compose.prod.yml restart
```

### Обновление проекта
```bash
cd ~/masterprofi
git pull
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml exec backend npm run migration:run
```

### Просмотр логов
```bash
docker compose -f docker-compose.prod.yml logs -f
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f web-admin
```

## Резервное копирование

### Бэкап базы данных
```bash
# Создать бэкап
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U masterprofi masterprofi > backup_$(date +%Y%m%d_%H%M%S).sql

# Восстановление
docker compose -f docker-compose.prod.yml exec -T postgres psql -U masterprofi masterprofi < backup_YYYYMMDD_HHMMSS.sql
```

### Автоматический бэкап (cron)
```bash
crontab -e
# Добавьте строку (бэкап каждый день в 2:00)
0 2 * * * cd /home/deploy/masterprofi && docker compose -f docker-compose.prod.yml exec -T postgres pg_dump -U masterprofi masterprofi > /home/deploy/backups/backup_$(date +\%Y\%m\%d).sql
```

## Решение проблем

### Docker не запускается
```bash
sudo systemctl status docker
sudo systemctl start docker
sudo systemctl enable docker
```

### Контейнеры не стартуют
```bash
docker compose -f docker-compose.prod.yml logs
docker compose -f docker-compose.prod.yml ps -a
```

### Проблемы с правами доступа
```bash
sudo chown -R deploy:deploy ~/masterprofi
```

### Проверка портов
```bash
sudo ss -tulpn | grep -E ':80|:443|:3000|:5432|:8080'
```

## Безопасность

1. **Смените пароль root:**
   ```bash
   sudo passwd root
   ```

2. **Отключите вход root по SSH:**
   ```bash
   sudo nano /etc/ssh/sshd_config
   # Установите: PermitRootLogin no
   sudo systemctl restart ssh
   ```

3. **Используйте только SSH ключи:**
   ```bash
   sudo nano /etc/ssh/sshd_config
   # Установите: PasswordAuthentication no
   sudo systemctl restart ssh
   ```

4. **Регулярно обновляйте систему:**
   ```bash
   sudo apt update && sudo apt upgrade
   ```

## Мониторинг

### Проверка использования ресурсов
```bash
htop
docker stats
df -h
free -h
```

### Проверка логов системы
```bash
sudo journalctl -u docker
sudo tail -f /var/log/nginx/error.log
```

