# Инструкция по сбросу пароля PostgreSQL

## Найден PostgreSQL 18 по пути: `C:\Program Files\PostgreSQL\18\`

### Шаг 1: Найдите файл pg_hba.conf

Файл должен быть в: `C:\Program Files\PostgreSQL\18\data\pg_hba.conf`

### Шаг 2: Отредактируйте pg_hba.conf (от имени администратора)

1. Откройте PowerShell или командную строку **от имени администратора**
2. Откройте файл в блокноте:
   ```
   notepad "C:\Program Files\PostgreSQL\18\data\pg_hba.conf"
   ```
3. Найдите строки, которые выглядят так:
   ```
   host    all             all             127.0.0.1/32            md5
   host    all             all             ::1/128                 md5
   ```
4. Замените `md5` на `trust`:
   ```
   host    all             all             127.0.0.1/32            trust
   host    all             all             ::1/128                 trust
   ```
5. Сохраните файл

### Шаг 3: Перезапустите службу PostgreSQL

В PowerShell от имени администратора:
```powershell
Restart-Service postgresql-x64-18
```

Или найдите службу в Services (services.msc) и перезапустите её.

### Шаг 4: Измените пароли

Запустите скрипт:
```bash
cd backend
node scripts/change-password.js
```

Или подключитесь напрямую (без пароля) и выполните:
```sql
ALTER USER postgres WITH PASSWORD 'новый_пароль_postgres';
ALTER USER masterprofi WITH PASSWORD 'MasterProfi2024!Secure';
```

### Шаг 5: Верните md5 в pg_hba.conf

1. Откройте файл снова
2. Верните `md5` вместо `trust`
3. Перезапустите службу PostgreSQL

---

**ВАЖНО:** Метод `trust` позволяет подключаться без пароля - это небезопасно для production!

