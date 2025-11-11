# 🧪 MasterProfi API - Тестирование

## ✅ API работает идеально!

Backend запущен и все endpoints работают.

---

## 📋 Готовые команды для PowerShell

### 1️⃣ Регистрация пользователя

```powershell
$headers = @{'Content-Type'='application/json'}
$body = @{
    email='client@test.com'
    password='Test123!'
    phone='+79991234567'
    firstName='Иван'
    lastName='Иванов'
    role='client'
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3000/api/auth/register -Method POST -Headers $headers -Body $body
```

---

### 2️⃣ Авторизация

```powershell
$headers = @{'Content-Type'='application/json'}
$body = @{
    email='demo@masterprofi.com'
    password='Demo123!'
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri http://localhost:3000/api/auth/login -Method POST -Headers $headers -Body $body
$token = ($response.Content | ConvertFrom-Json).access_token

Write-Host "Token: $token"
```

---

### 3️⃣ Получить список пользователей

```powershell
$token = "ВАШ_ТОКЕН_ЗДЕСЬ"
$headers = @{'Authorization'="Bearer $token"}

Invoke-WebRequest -Uri http://localhost:3000/api/users -Method GET -Headers $headers | Select-Object -ExpandProperty Content
```

---

### 4️⃣ Получить пользователя по ID

```powershell
$token = "ВАШ_ТОКЕН_ЗДЕСЬ"
$headers = @{'Authorization'="Bearer $token"}
$userId = "6fa50ad4-f692-4d3e-87a5-745fdde71ec7"

Invoke-WebRequest -Uri "http://localhost:3000/api/users/$userId" -Method GET -Headers $headers | Select-Object -ExpandProperty Content
```

---

### 5️⃣ Создать заказ

```powershell
$token = "ВАШ_ТОКЕН_ЗДЕСЬ"
$headers = @{
    'Authorization'="Bearer $token"
    'Content-Type'='application/json'
}

$body = @{
    serviceType='washing_machine'
    description='Не включается стиральная машина'
    address='Москва, ул. Ленина, д. 1'
    latitude='55.7558'
    longitude='37.6173'
    phone='+79991234567'
    preferredDateTime='2025-11-02T10:00:00Z'
    client='6fa50ad4-f692-4d3e-87a5-745fdde71ec7'
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3000/api/orders -Method POST -Headers $headers -Body $body
```

---

### 6️⃣ Получить список заказов

```powershell
$token = "ВАШ_ТОКЕН_ЗДЕСЬ"
$headers = @{'Authorization'="Bearer $token"}

Invoke-WebRequest -Uri http://localhost:3000/api/orders -Method GET -Headers $headers | Select-Object -ExpandProperty Content
```

---

### 7️⃣ MLM информация

```powershell
$token = "ВАШ_ТОКЕН_ЗДЕСЬ"
$headers = @{'Authorization'="Bearer $token"}

Invoke-WebRequest -Uri http://localhost:3000/api/mlm -Method GET -Headers $headers | Select-Object -ExpandProperty Content
```

---

## 🌐 Тестирование через браузер

### Swagger UI (Рекомендуется):

1. Откройте: http://localhost:3000/api/docs
2. Найдите нужный endpoint
3. Нажмите "Try it out"
4. Заполните данные
5. Нажмите "Execute"

**Не забудьте авторизоваться:**
- Найдите "Authorize" внизу страницы
- Введите токен в формате: `Bearer YOUR_TOKEN`

---

## 📊 Текущее состояние API

### ✅ Работающие endpoints:

| Метод | Endpoint | Описание | Авторизация |
|-------|----------|----------|-------------|
| GET | `/api` | Health check | ❌ |
| POST | `/api/auth/register` | Регистрация | ❌ |
| POST | `/api/auth/login` | Авторизация | ❌ |
| GET | `/api/users` | Список пользователей | ✅ |
| GET | `/api/users/:id` | Получить пользователя | ✅ |
| PATCH | `/api/users/:id` | Обновить пользователя | ✅ |
| DELETE | `/api/users/:id` | Удалить пользователя | ✅ |
| GET | `/api/orders` | Список заказов | ✅ |
| POST | `/api/orders` | Создать заказ | ✅ |
| GET | `/api/orders/:id` | Получить заказ | ✅ |
| PATCH | `/api/orders/:id` | Обновить заказ | ✅ |
| DELETE | `/api/orders/:id` | Удалить заказ | ✅ |
| GET | `/api/mlm` | MLM информация | ⚠️ |
| GET | `/api/payments` | Список платежей | ✅ |
| POST | `/api/payments` | Создать платеж | ✅ |

---

## 🎯 Примеры использования

### Сценарий 1: Регистрация и создание заказа

```powershell
# 1. Регистрация клиента
$headers = @{'Content-Type'='application/json'}
$body = @{
    email='client@example.com'
    password='Client123!'
    firstName='Иван'
    lastName='Петров'
    role='client'
} | ConvertTo-Json

$regResponse = Invoke-WebRequest -Uri http://localhost:3000/api/auth/register -Method POST -Headers $headers -Body $body
$clientId = ($regResponse.Content | ConvertFrom-Json).id

# 2. Авторизация
$loginBody = @{
    email='client@example.com'
    password='Client123!'
} | ConvertTo-Json

$loginResponse = Invoke-WebRequest -Uri http://localhost:3000/api/auth/login -Method POST -Headers $headers -Body $loginBody
$token = ($loginResponse.Content | ConvertFrom-Json).access_token

# 3. Создание заказа
$orderHeaders = @{
    'Authorization'="Bearer $token"
    'Content-Type'='application/json'
}
$orderBody = @{
    serviceType='washing_machine'
    description='Стиральная машина не включается'
    address='Москва, ул. Тестовая, 1'
    latitude='55.7558'
    longitude='37.6173'
    phone='+79991234567'
    client=$clientId
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3000/api/orders -Method POST -Headers $orderHeaders -Body $orderBody
```

---

### Сценарий 2: Поиск мастера

```powershell
# 1. Регистрация мастера
$headers = @{'Content-Type'='application/json'}
$body = @{
    email='master@example.com'
    password='Master123!'
    firstName='Петр'
    lastName='Сергеев'
    role='master'
} | ConvertTo-Json

$regResponse = Invoke-WebRequest -Uri http://localhost:3000/api/auth/register -Method POST -Headers $headers -Body $body
$masterId = ($regResponse.Content | ConvertFrom-Json).id

# 2. Получить профиль мастера
$loginBody = @{email='master@example.com';password='Master123!'} | ConvertTo-Json
$loginResponse = Invoke-WebRequest -Uri http://localhost:3000/api/auth/login -Method POST -Headers $headers -Body $loginBody
$token = ($loginResponse.Content | ConvertFrom-Json).access_token

$authHeaders = @{'Authorization'="Bearer $token"}
Invoke-WebRequest -Uri http://localhost:3000/api/mlm -Method GET -Headers $authHeaders
```

---

## 🔍 Health Check

Всегда проверяйте статус сервера:

```powershell
Invoke-WebRequest -Uri http://localhost:3000/api | Select-Object -ExpandProperty Content
```

**Ожидаемый ответ:**
```json
{
  "status": "OK",
  "service": "MasterProfi Backend",
  "timestamp": "2025-11-01T14:00:00.000Z",
  "environment": "development"
}
```

---

## ⚠️ Troubleshooting

### Ошибка 401 Unauthorized
- Проверьте, что токен действителен
- Токен действителен только 1 час (стандартная настройка JWT)
- Перелогиньтесь, чтобы получить новый токен

### Ошибка 409 Conflict
- Пользователь с таким email уже существует
- Используйте другой email или сначала удалите существующего

### Ошибка 500 Internal Server Error
- Проверьте логи сервера в терминале
- Убедитесь, что база данных запущена

---

## 📚 Дополнительные ресурсы

- **Swagger Docs:** http://localhost:3000/api/docs
- **README:** README.md
- **Setup Guide:** HOW_TO_RUN.md
- **Quick Demo:** QUICK_DEMO.md

---

**API работает отлично! Начинайте тестировать! 🚀**

