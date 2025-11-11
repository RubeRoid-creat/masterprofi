import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";
import { LoggerService } from "./logger/logger.service";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";
import { AllExceptionsFilter } from "./common/filters/http-exception.filter";
import { MetricsService } from "./metrics/metrics.service";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cookieParser = require("cookie-parser");

async function bootstrap() {
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      bufferLogs: true, // Буферизуем логи до инициализации
    });

    // Настройка статических файлов для загрузок
    app.useStaticAssets(join(__dirname, "..", "uploads"), {
      prefix: "/uploads/",
    });

    // Global prefix
    app.setGlobalPrefix("api");

    // Обработчик для корневого пути (после установки глобального префикса)
    // Используем Express напрямую, чтобы обойти глобальный префикс
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.get("/", (req: any, res: any) => {
      res.redirect("/api");
    });

    // Получаем экземпляры сервисов после инициализации модулей
    const logger = app.get(LoggerService);
    const metrics = app.get(MetricsService);

    // Используем наш логгер вместо стандартного
    app.useLogger(logger);

    // Устанавливаем глобальные интерцепторы и фильтры
    app.useGlobalInterceptors(new LoggingInterceptor(logger, metrics));
    app.useGlobalFilters(new AllExceptionsFilter(logger, metrics));

    // Validation
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false, // Разрешаем дополнительные поля для совместимости с мобильным приложением
        transform: true,
        transformOptions: {
          enableImplicitConversion: true, // Автоматическое преобразование типов
        },
      })
    );

    // Cookie parser
    app.use(cookieParser());

    // Trust proxy для правильного определения IP (важно для rate limiting)
    const httpAdapter = app.getHttpAdapter();
    if (httpAdapter.getType() === "express") {
      httpAdapter.getInstance().set("trust proxy", true);
    }

    // CORS - разрешаем все необходимые источники
    const allowedOrigins = [
      process.env.FRONTEND_URL || "http://localhost:5173", // Web admin
      "http://localhost:19006", // Expo web default
      "http://localhost:8081", // Expo metro bundler
      "http://localhost:3000", // Backend itself
      /^http:\/\/localhost:\d+$/, // Any localhost port (for dev)
      /^http:\/\/10\.0\.2\.2:\d+$/, // Android emulator
      /^http:\/\/10\.0\.\d+\.\d+:\d+$/, // Internal network IPs (10.0.x.x)
      /^http:\/\/192\.168\.\d+\.\d+:\d+$/, // Local network IPs (192.168.x.x)
      /^http:\/\/46\.73\.\d+\.\d+:\d+$/, // External IP range (46.73.x.x)
      /^http:\/\/212\.74\.\d+\.\d+:\d+$/, // External IP range (212.74.x.x) - Selectel
    ];

    app.enableCors({
      origin: (origin, callback) => {
        // Разрешаем запросы без origin (например, мобильные приложения, Postman)
        if (!origin) {
          return callback(null, true);
        }

        // Проверяем разрешенные источники
        const isAllowed = allowedOrigins.some((allowed) => {
          if (typeof allowed === "string") {
            return origin === allowed;
          }
          if (allowed instanceof RegExp) {
            return allowed.test(origin);
          }
          return false;
        });

        if (isAllowed || process.env.NODE_ENV === "development") {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: [
        "Content-Type", 
        "Authorization", 
        "X-Requested-With",
        "x-environment",
        "x-app-version",
      ],
    });

    // Swagger
    const config = new DocumentBuilder()
      .setTitle("MasterProfi API")
      .setDescription("MasterProfi Service Platform API")
      .setVersion("1.0")
      .addBearerAuth()
      .addCookieAuth("access_token")
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api/docs", app, document);

    const port = process.env.PORT || 3000;
    await app.listen(port);

    // Логируем успешный запуск
    logger.log(`🚀 MasterProfi Backend running on: http://localhost:${port}`, "Bootstrap");
    logger.log(`📚 API Docs: http://localhost:${port}/api/docs`, "Bootstrap");
    logger.log(`📊 Metrics: http://localhost:${port}/api/metrics`, "Bootstrap");
    logger.log(`Environment: ${process.env.NODE_ENV || "development"}`, "Bootstrap");
  } catch (error: any) {
    // Fallback логирование если LoggerService недоступен
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

bootstrap();
