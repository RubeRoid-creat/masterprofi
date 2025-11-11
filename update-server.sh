#!/bin/bash

# Скрипт для обновления проекта на сервере
# Использование: ./update-server.sh

set -e

echo "🚀 Начинаем обновление проекта на сервере..."

# Переходим в директорию проекта
cd /root/masterprofi || cd ~/masterprofi || {
    echo "❌ Ошибка: Директория проекта не найдена"
    exit 1
}

echo "📦 Обновляем код из Git..."
git pull origin main

echo "🛑 Останавливаем контейнеры..."
docker compose -f docker-compose.prod.yml down

echo "🔨 Пересобираем web-admin..."
docker compose -f docker-compose.prod.yml build --no-cache web-admin

echo "▶️  Запускаем контейнеры..."
docker compose -f docker-compose.prod.yml up -d

echo "⏳ Ждем запуска контейнеров..."
sleep 5

echo "📊 Проверяем статус контейнеров..."
docker compose -f docker-compose.prod.yml ps

echo "✅ Обновление завершено!"
echo "🌐 Проверьте приложение: http://212.74.227.208:8080"
echo ""
echo "📝 Для просмотра логов:"
echo "   docker compose -f docker-compose.prod.yml logs -f web-admin"

