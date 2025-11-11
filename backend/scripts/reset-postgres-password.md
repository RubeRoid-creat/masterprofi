# Инструкция по сбросу пароля PostgreSQL

## Вариант 1: Если PostgreSQL запущен через Docker

Если PostgreSQL запущен в Docker, самый простой способ:

1. Остановить контейнер:
```bash
docker stop masterprofi_postgres
```

2. Удалить volume (ВНИМАНИЕ: это удалит все данные!):
```bash
docker-compose down -v
```

3. Запустить заново с новым паролем (уже обновлен в docker-compose.yml):
```bash
docker-compose up -d postgres
```

## Вариант 2: Если PostgreSQL установлен локально (Windows)

### Способ A: Через файл pg_hba.conf

1. Найдите файл `pg_hba.conf` (обычно находится в `C:\Program Files\PostgreSQL\<версия>\data\`)

2. Откройте его от имени администратора

3. Найдите строки с методом аутентификации и измените на `trust`:
```
# Было:
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5

# Станет:
host    all             all             127.0.0.1/32            trust
host    all             all             ::1/128                 trust
```

4. Перезапустите службу PostgreSQL:
```powershell
Restart-Service postgresql-x64-14  # или другая версия
```

5. Подключитесь без пароля и измените пароль:
```sql
ALTER USER postgres WITH PASSWORD 'новый_пароль';
ALTER USER masterprofi WITH PASSWORD 'MasterProfi2024!Secure';
```

6. Верните `md5` в pg_hba.conf и перезапустите службу

### Способ B: Через командную строку (если служба запущена)

1. Найдите файл `pg_hba.conf`
2. Временно измените метод аутентификации на `trust`
3. Перезапустите службу
4. Измените пароль через psql или SQL команду

## Вариант 3: Попробовать стандартные пароли

Попробуйте подключиться с распространенными паролями:
- postgres
- root
- admin
- (пустой пароль)
- masterprofi_pass

## Вариант 4: Полная переустановка (последний вариант)

Если ничего не помогает и данные не критичны, можно переустановить PostgreSQL.

