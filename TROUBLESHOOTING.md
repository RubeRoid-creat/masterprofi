# 🔧 Troubleshooting - Решение проблем

## ✅ Текущее состояние:

### Backend работает:
- URL: http://localhost:3000
- Status: ✅ OK
- Swagger: http://localhost:3000/api/docs

### Frontend работает:
- URL: http://localhost:5173
- Status: ✅ Работает
- Порт слушает корректно

---

## 🆘 Если Frontend не открывается:

### 1. Проверить, запущен ли сервер:

#### Backend:
```powershell
netstat -ano | findstr ":3000"
```

Должно показать: `LISTENING`

#### Frontend:
```powershell
netstat -ano | findstr ":5173"
```

Должно показать: `LISTENING`

---

### 2. Перезапустить серверы:

#### Backend:
```powershell
cd "Z:\App RBT\backend"
npm run start:dev
```

#### Frontend:
```powershell
cd "Z:\App RBT\web-admin"
npm run dev
```

---

### 3. Очистить кэш:

#### Frontend:
```powershell
cd "Z:\App RBT\web-admin"
Remove-Item -Recurse -Force node_modules\.vite
npm run dev
```

#### Browser:
- Откройте DevTools (F12)
- Правый клик на кнопку обновления
- Выберите "Очистить кэш и жесткая перезагрузка"

---

### 4. Проверить доступность:

#### Backend:
```powershell
Invoke-WebRequest -Uri http://localhost:3000/api
```

Должно вернуть: `{"status":"OK"...}`

#### Frontend:
```powershell
Invoke-WebRequest -Uri http://localhost:5173
```

Должно вернуть HTML код

---

### 5. Проверить файрвол:

```powershell
# Разрешить порты в Windows Firewall
netsh advfirewall firewall add rule name="MasterProfi Backend" dir=in action=allow protocol=TCP localport=3000
netsh advfirewall firewall add rule name="MasterProfi Frontend" dir=in action=allow protocol=TCP localport=5173
```

---

## 🐛 Частые проблемы:

### Проблема: Белый экран
**Решение:**
1. Откройте DevTools (F12)
2. Проверьте Console на ошибки
3. Проверьте Network tab
4. Очистите localStorage:
   ```javascript
   localStorage.clear()
   ```

---

### Проблема: "Ошибка авторизации"
**Решение:**
1. Проверьте, что Backend запущен
2. Проверьте CORS настройки
3. Проверьте URL в `src/services/api.ts`:
   ```typescript
   const API_BASE_URL = "http://localhost:3000/api";
   ```

---

### Проблема: "Connection refused"
**Решение:**
1. Проверьте, запущен ли сервер
2. Проверьте порт
3. Проверьте, не заблокирован ли порт антивирусом

---

### Проблема: "Module not found"
**Решение:**
```powershell
# Удалить node_modules и переустановить
cd "Z:\App RBT\web-admin"
Remove-Item -Recurse -Force node_modules
npm install

cd "Z:\App RBT\backend"
Remove-Item -Recurse -Force node_modules
npm install
```

---

## 📋 Проверочный чеклист:

### Перед запуском:
- ✅ Node.js установлен (18+)
- ✅ PostgreSQL запущен
- ✅ База данных создана
- ✅ .env файл настроен
- ✅ Все зависимости установлены

### При запуске:
- ✅ Backend запускается без ошибок
- ✅ Frontend компилируется без ошибок
- ✅ Нет TypeScript ошибок
- ✅ Порт 3000 доступен
- ✅ Порт 5173 доступен

---

## 🔍 Диагностика:

### Логи Backend:
```powershell
cd "Z:\App RBT\backend"
npm run start:dev
```

Смотрите логи в консоли!

### Логи Frontend:
```powershell
cd "Z:\App RBT\web-admin"
npm run dev
```

Смотрите логи в консоли!

### Browser Console:
1. Откройте DevTools (F12)
2. Смотрите вкладку Console
3. Смотрите вкладку Network

---

## 💡 Быстрые решения:

### Полная перезагрузка:
```powershell
# Остановить все процессы
Stop-Process -Name node -Force -ErrorAction SilentlyContinue

# Подождать
Start-Sleep -Seconds 2

# Запустить Backend
cd "Z:\App RBT\backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run start:dev"

# Подождать
Start-Sleep -Seconds 5

# Запустить Frontend
cd "Z:\App RBT\web-admin"
npm run dev
```

---

### Проверка конфигурации:

#### Backend .env:
```env
DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=masterprofi
JWT_SECRET=dev-secret-key
```

#### Frontend api.ts:
```typescript
const API_BASE_URL = "http://localhost:3000/api";
```

---

## 📞 Получить помощь:

### Если ничего не помогло:
1. Проверьте все логи
2. Откройте DevTools в браузере
3. Проверьте Network tab
4. Проверьте Console на ошибки
5. Попробуйте другой браузер
6. Перезагрузите компьютер

---

## ✅ Все должно работать!

Если серверы запущены и порты слушают, сайт должен открываться!

**Попробуйте:**
1. Закрыть браузер полностью
2. Открыть заново
3. Перейти на http://localhost:5173
4. Если не помогло - очистить кэш браузера

🎉 **Все настройки правильные!** 🎉

