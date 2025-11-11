# Быстрый старт на Ubuntu - IP: 212.74.227.208

## 🚀 Подключение к серверу

### Подключение к серверу:
```bash
ssh ubuntu@212.74.227.208
# или
ssh root@212.74.227.208
```

**Пароль:** (ваш пароль root/ubuntu)

## 📦 Установка Docker и зависимостей

```bash
# Обновление системы
sudo apt update && sudo apt -y upgrade

# Установка базовых пакетов
sudo apt -y install \
  ca-certificates \
  curl \
  gnupg \
  git \
  ufw \
  nano \
  htop \
  wget

# Установка Docker
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt -y install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Проверка установки
docker --version
docker compose version
```

## 👤 Создание пользователя deploy

```bash
sudo useradd -m -s /bin/bash deploy
sudo usermod -aG sudo deploy
sudo usermod -aG docker deploy

# Переключение на пользователя deploy
sudo su - deploy
```

## 🔥 Настройка Firewall

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
sudo ufw status verbose
```

## 📥 Загрузка проекта

### Вариант 1: Через Git
```bash
cd ~
git clone <URL_вашего_репозитория> masterprofi
cd masterprofi
```

### Вариант 2: Через SCP (с локальной машины)
```powershell
# В PowerShell на вашей машине
scp -r "Z:\App RBT\*" deploy@212.74.227.208:~/masterprofi/
```

### Вариант 3: Через WinSCP
- Host: `212.74.227.208`
- User: `deploy`
- Protocol: SFTP
- Port: 22

## ⚙️ Создание .env файла

```bash
cd ~/masterprofi
nano .env
```

Содержимое `.env`:
```env
POSTGRES_USER=masterprofi
POSTGRES_PASSWORD=ИЗМЕНИТЕ_НА_СИЛЬНЫЙ_ПАРОЛЬ_123
POSTGRES_DB=masterprofi
JWT_SECRET=ИЗМЕНИТЕ_НА_СИЛЬНЫЙ_СЕКРЕТ_JWT
JWT_REFRESH_SECRET=ИЗМЕНИТЕ_НА_СИЛЬНЫЙ_СЕКРЕТ_REFRESH
JWT_EXPIRES_IN=1h
YOOKASSA_SHOP_ID=
YOOKASSA_SECRET_KEY=
VITE_API_URL=http://212.74.227.208:3000/api
```

**Важно:** Замените все пароли и секреты на безопасные случайные строки!

## 🚀 Запуск проекта

```bash
cd ~/masterprofi

# Сборка Docker образов
docker compose -f docker-compose.prod.yml build

# Запуск контейнеров
docker compose -f docker-compose.prod.yml up -d

# Проверка статуса
docker compose -f docker-compose.prod.yml ps

# Применение миграций БД
docker compose -f docker-compose.prod.yml exec backend npm run migration:run
```

## ✅ Проверка работы

```bash
# Просмотр логов
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f web-admin

# Проверка доступности
curl -I http://212.74.227.208:8080  # Web-admin
curl -I http://212.74.227.208:3000  # Backend API
```

Откройте в браузере:
- **Web-admin:** http://212.74.227.208:8080
- **API:** http://212.74.227.208:3000

## 🔧 Полезные команды

### Просмотр логов
```bash
docker compose -f docker-compose.prod.yml logs -f
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f web-admin
```

### Перезапуск
```bash
docker compose -f docker-compose.prod.yml restart
```

### Остановка
```bash
docker compose -f docker-compose.prod.yml down
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

### Проблемы с правами
```bash
sudo chown -R deploy:deploy ~/masterprofi
```

### Проверка портов
```bash
sudo ss -tulpn | grep -E ':80|:443|:3000|:5432|:8080'
```

## 🔒 Безопасность

1. **Смените пароль root:**
   ```bash
   sudo passwd root
   ```

2. **Отключите вход root по SSH:**
   ```bash
   sudo nano /etc/ssh/sshd_config
   # Найдите и измените: PermitRootLogin no
   sudo systemctl restart ssh
   ```

3. **Настройте SSH ключи:**
   ```bash
   # На вашей локальной машине:
   ssh-copy-id deploy@212.74.227.208
   ```

## 📝 Примечания

- Публичный IP: `212.74.227.208`
- Приватный IP: `192.168.0.66` (для внутренней сети)

## 🎯 Следующие шаги

1. Настройте домен (если есть публичный IP)
2. Установите Nginx и SSL сертификат
3. Настройте автоматические бэкапы БД
4. Создайте первого администратора

