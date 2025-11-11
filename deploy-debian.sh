#!/bin/bash
set -e

echo "=== Установка MasterProfi на Debian ==="

# Проверка прав root
if [ "$EUID" -ne 0 ]; then 
  echo "Пожалуйста, запустите скрипт с правами root (sudo ./deploy-debian.sh)"
  exit 1
fi

# Обновление системы
echo "Обновление системы..."
apt update && apt -y upgrade

# Установка базовых пакетов
echo "Установка базовых пакетов..."
apt -y install \
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

# Установка Docker
echo "Установка Docker..."
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

apt update
apt -y install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Настройка Docker для пользователя deploy
if id "deploy" &>/dev/null; then
  usermod -aG docker deploy
else
  echo "Создание пользователя deploy..."
  useradd -m -s /bin/bash deploy
  usermod -aG docker deploy
  usermod -aG sudo deploy
fi

# Настройка firewall
echo "Настройка firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Создание директории проекта
PROJECT_DIR="/opt/masterprofi"
mkdir -p $PROJECT_DIR
chown deploy:deploy $PROJECT_DIR

echo ""
echo "=== Установка завершена! ==="
echo ""
echo "Следующие шаги:"
echo "1. Переключитесь на пользователя deploy: su - deploy"
echo "2. Перейдите в директорию проекта: cd $PROJECT_DIR"
echo "3. Склонируйте проект: git clone <URL_репозитория> ."
echo "4. Создайте .env файл (см. DEPLOYMENT.md)"
echo "5. Запустите: docker compose -f docker-compose.prod.yml up -d"
echo ""




