# Руководство по тестированию

## Структура тестов

```
backend/
├── src/
│   └── **/*.spec.ts          # Unit тесты
├── test/
│   ├── *.e2e-spec.ts         # E2E тесты
│   ├── setup.ts              # Настройка unit тестов
│   └── setup-e2e.ts          # Настройка E2E тестов
├── jest.config.js            # Конфигурация Jest для unit тестов
└── test/jest-e2e.json       # Конфигурация Jest для E2E тестов
```

## Запуск тестов

### Unit тесты

```bash
# Запустить все unit тесты
npm test

# Запустить в watch режиме
npm run test:watch

# С покрытием кода
npm run test:cov

# С проверкой покрытия >80%
npm run test:cov:check
```

### E2E тесты

```bash
# Запустить все E2E тесты
npm run test:e2e

# Запустить в watch режиме
npm run test:e2e:watch
```

## Покрытие кода

Требования к покрытию: **>80%** для всех метрик:
- Branches (ветвления)
- Functions (функции)
- Lines (строки)
- Statements (утверждения)

Отчеты сохраняются в `backend/coverage/`:
- HTML отчет: `coverage/lcov-report/index.html`
- LCOV отчет: `coverage/lcov.info`

## Примеры тестов

### Unit тесты (Jest)

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { MyService } from "./my.service";

describe("MyService", () => {
  let service: MyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MyService],
    }).compile();

    service = module.get<MyService>(MyService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("myMethod", () => {
    it("should return expected value", () => {
      const result = service.myMethod();
      expect(result).toBeDefined();
    });
  });
});
```

### E2E тесты (Supertest)

```typescript
import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";

describe("AppController (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("/api (GET)", () => {
    return request(app.getHttpServer())
      .get("/api")
      .expect(200)
      .expect((res) => {
        expect(res.body).toBeDefined();
      });
  });
});
```

## Моки и заглушки

### Моки репозиториев TypeORM

```typescript
const mockRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

// В провайдерах
{
  provide: getRepositoryToken(Entity),
  useValue: mockRepository,
}
```

### Моки сервисов

```typescript
const mockService = {
  method: jest.fn(),
};

// В провайдерах
{
  provide: SomeService,
  useValue: mockService,
}
```

## Best Practices

1. **Изоляция тестов**: каждый тест должен быть независимым
2. **Очистка после тестов**: используйте `afterEach` или `beforeEach` для очистки моков
3. **Тестируйте поведение, а не реализацию**: фокусируйтесь на том, что делает код, а не как
4. **Используйте описательные имена**: `it("should return error when user not found")` лучше чем `it("test1")`
5. **AAA паттерн**: Arrange (подготовка) -> Act (действие) -> Assert (проверка)

## CI/CD интеграция

Для CI/CD добавьте проверку покрытия:

```yaml
# .github/workflows/test.yml
- name: Run tests with coverage
  run: npm run test:cov:check
```

## Проблемы и решения

### Тесты падают из-за асинхронности

Используйте `async/await` или возвращайте промисы:

```typescript
it("should handle async", async () => {
  const result = await service.asyncMethod();
  expect(result).toBeDefined();
});
```

### Тесты зависят от базы данных

Используйте in-memory базу данных или моки:

```typescript
// Мок репозитория
const mockRepository = {
  findOne: jest.fn().mockResolvedValue(mockData),
};
```

### Coverage не достигает 80%

1. Проверьте исключенные файлы в `jest.config.js`
2. Добавьте тесты для недостающих веток
3. Проверьте неиспользуемый код

## Полезные команды

```bash
# Запустить конкретный тест
npm test -- auth.service.spec.ts

# Запустить тесты с фильтром
npm test -- -t "should login"

# Показать покрытие конкретного файла
npm run test:cov -- users.service.ts

# Отладка тестов
npm run test:debug
```

