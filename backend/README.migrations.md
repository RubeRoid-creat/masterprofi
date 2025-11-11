# Руководство по миграциям БД

## Настройка

Миграции настроены для использования вместо `synchronize: true`. Это безопасный способ управления схемой БД в production.

## Структура

```
backend/
├── ormconfig.ts                 # Конфигурация для TypeORM CLI
├── src/
│   ├── migrations/             # Миграции базы данных
│   │   └── *.ts               # Файлы миграций
│   └── database/
│       └── seeds/             # Seed данные
│           ├── user.seed.ts   # Seed пользователей
│           ├── mlm.seed.ts    # Seed MLM данных
│           └── run-seeds.ts   # Запуск всех seeds
```

## Команды

### Генерация миграций

```bash
# Автоматическая генерация миграции на основе изменений в entities
npm run migration:generate src/migrations/MigrationName

# Создание пустой миграции (для ручных изменений)
npm run migration:create src/migrations/MigrationName
```

### Применение миграций

```bash
# Применить все невыполненные миграции
npm run migration:run

# Откатить последнюю миграцию
npm run migration:revert

# Показать статус миграций
npm run migration:show
```

### Seed данные

```bash
# Запустить все seed данные
npm run seed:run
```

## Workflow

### При изменении entities

1. Измените entity файл
2. Сгенерируйте миграцию:
   ```bash
   npm run migration:generate src/migrations/AddNewColumnToUsers
   ```
3. Проверьте сгенерированную миграцию
4. Примените миграцию:
   ```bash
   npm run migration:run
   ```

### При создании новой таблицы

1. Создайте entity файл
2. Сгенерируйте миграцию:
   ```bash
   npm run migration:generate src/migrations/CreateNewTable
   ```
3. Примените миграцию

### Seed данные

Seed данные создают начальные данные для разработки и тестирования:

- **Admin user**: admin@masterprofi.ru / admin123
- **Master user**: master@masterprofi.ru / master123
- **Client user**: client@masterprofi.ru / client123
- MLM структуру (реферальные связи)

## Примеры

### Создание миграции для добавления поля

```typescript
// 1. Измените entity
@Column({ nullable: true })
newField: string;

// 2. Сгенерируйте миграцию
npm run migration:generate src/migrations/AddNewFieldToUsers

// 3. Проверьте и примените
npm run migration:run
```

### Ручная миграция

```typescript
import { MigrationInterface, QueryRunner } from "typeorm";

export class CustomMigration1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users ADD COLUMN "newColumn" varchar;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users DROP COLUMN "newColumn";
    `);
  }
}
```

## Production

В production:

1. **Отключен auto-sync**: `synchronize: false`
2. **Миграции запускаются вручную** или через CI/CD
3. **Seed данные не запускаются автоматически**

### Деплой с миграциями

```bash
# 1. Собрать проект
npm run build

# 2. Применить миграции
npm run migration:run

# 3. Запустить приложение
npm run start:prod
```

## Troubleshooting

### Ошибка: "relation already exists"

Миграция уже была применена. Проверьте:
```bash
npm run migration:show
```

### Ошибка при откате

Откат может быть невозможен, если миграция изменяла данные. Проверьте метод `down()` в миграции.

### Конфликт миграций

Если несколько разработчиков создали миграции с одинаковым timestamp:
1. Используйте актуальный timestamp
2. Переименуйте файлы миграций
3. Примените в правильном порядке

## Best Practices

1. **Всегда проверяйте сгенерированные миграции** перед применением
2. **Тестируйте миграции** на тестовой БД перед production
3. **Делайте backup БД** перед применением миграций в production
4. **Не изменяйте примененные миграции** - создавайте новые
5. **Документируйте сложные миграции** в комментариях

## Seed данные

Seed данные используются для:
- Начальной загрузки тестовых данных
- Создания пользователей для разработки
- Настройки MLM структуры

Запуск seeds безопасен и идемпотентен - повторный запуск не создаст дубликаты.

