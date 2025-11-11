# Быстрый старт на Debian - IP: 80.249.151.59

## 🚀 Пошаговая инструкция

### Шаг 1: Подключение к серверу
```bash
ssh root@80.249.151.59
# Введите пароль при запросе
```

### Шаг 2: Установка Docker и необходимых пакетов
```bash
# Обновление системы
apt update && apt -y upgrade

# Установка базовых пакетов
apt -y install ca-certificates curl gnupg git ufw nano wget

# Установка Docker
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt update
apt -y install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### Шаг 3: Создание пользователя deploy
```bash
useradd -m -s /bin/bash deploy
usermod -aG sudo deploy
usermod -aG docker deploy
```

### Шаг 4: Настройка firewall
```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

### Шаг 5: Переключение на пользователя deploy
```bash
su - deploy
```

### Шаг 6: Загрузка проекта

**Вариант A: Через Git (если есть репозиторий)**
```bash
cd ~
git clone <URL_вашего_репозитория> masterprofi
cd masterprofi
```

**Вариант B: Через SCP с вашей локальной машины**
На вашей локальной машине (Windows PowerShell):
```powershell
# Установите OpenSSH если еще не установлен
# Затем выполните:
scp -r "Z:\App RBT\*" deploy@80.249.151.59:~/masterprofi/
```

**Вариант C: Создать файлы вручную на сервере**
```bash
mkdir -p ~/masterprofi
cd ~/masterprofi
# Скопируйте файлы проекта сюда
```

### Шаг 7: Создание .env файла
```bash
cd ~/masterprofi
nano .env
```

Вставьте следующее (ОБЯЗАТЕЛЬНО измените пароли и секреты!):
```env
POSTGRES_USER=masterprofi
POSTGRES_PASSWORD=ИЗМЕНИТЕ_ЭТОТ_ПАРОЛЬ_123
POSTGRES_DB=masterprofi
JWT_SECRET=ИЗМЕНИТЕ_ЭТОТ_СЕКРЕТ_JWT
JWT_REFRESH_SECRET=ИЗМЕНИТЕ_ЭТОТ_СЕКРЕТ_REFRESH
JWT_EXPIRES_IN=1h
YOOKASSA_SHOP_ID=
YOOKASSA_SECRET_KEY=
VITE_API_URL=http://80.249.151.59:3000/api
```

Сохраните: `Ctrl+O`, `Enter`, `Ctrl+X`

### Шаг 8: Сборка и запуск проекта
```bash
cd ~/masterprofi

# Сборка Docker образов
docker compose -f docker-compose.prod.yml build

# Запуск контейнеров
docker compose -f docker-compose.prod.yml up -d

# Проверка статуса
docker compose -f docker-compose.prod.yml ps
```

### Шаг 9: Применение миграций базы данных
```bash
docker compose -f docker-compose.prod.yml exec backend npm run migration:run
```

### Шаг 10: Проверка работы
```bash
# Просмотр логов
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f web-admin

# Проверка доступности (в другом терминале или браузере)
curl -I http://80.249.151.59:8080  # Web-admin
curl -I http://80.249.151.59:3000  # Backend API
```

## ✅ Проверка успешного запуска

Откройте в браузере:
- **Web-admin:** http://80.249.151.59:8080
- **API:** http://80.249.151.59:3000 (если нужно проверить напрямую)

## 🔧 Полезные команды

### Просмотр логов
```bash
docker compose -f docker-compose.prod.yml logs -f
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f web-admin
```

### Перезапуск сервисов
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

### Ошибка подключения к базе данных
Проверьте .env файл и убедитесь, что пароли совпадают:
```bash
cat .env
docker compose -f docker-compose.prod.yml logs postgres
```

### Проблемы с правами доступа
```bash
sudo chown -R deploy:deploy ~/masterprofi
```

## 🔒 Безопасность (ВАЖНО!)

После успешного запуска:

1. **Смените пароль root:**
   ```bash
   passwd root
   ```

2. **Отключите вход root по SSH:**
   ```bash
   nano /etc/ssh/sshd_config
   # Найдите и измените: PermitRootLogin no
   systemctl restart ssh
   ```

3. **Настройте SSH ключи вместо паролей:**
   ```bash
   # На вашей локальной машине:
   ssh-copy-id deploy@80.249.151.59
   ```

## 📝 Следующие шаги

1. Настройте домен (если есть):
   - Создайте A-запись: `ваш-домен.ru` → `80.249.151.59`
   - Обновите VITE_API_URL в .env на `https://ваш-домен.ru/api`

2. Установите Nginx и SSL:
   - См. раздел "Настройка Nginx" в DEPLOY_DEBIAN.md

3. Настройте автоматические бэкапы БД

4. Создайте первого администратора через API или админ-панель

## 📞 Нужна помощь?

Если что-то не работает, пришлите вывод команд:
```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs backend
docker compose -f docker-compose.prod.yml logs web-admin
```




