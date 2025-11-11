import { Injectable, LoggerService as NestLoggerService } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as winston from "winston";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const DailyRotateFile = require("winston-daily-rotate-file");
import { existsSync, mkdirSync } from "fs";
import { join } from "path";

export enum LogLevel {
  ERROR = "error",
  WARN = "warn",
  INFO = "info",
  DEBUG = "debug",
  VERBOSE = "verbose",
}

@Injectable()
export class LoggerService implements NestLoggerService {
  private winstonLogger: winston.Logger;
  private logDir: string;

  constructor(private configService: ConfigService) {
    this.logDir = this.configService.get<string>("LOG_DIR") || join(process.cwd(), "logs");
    
    // Создаем директорию для логов, если её нет
    if (!existsSync(this.logDir)) {
      mkdirSync(this.logDir, { recursive: true });
    }

    this.winstonLogger = this.createWinstonLogger();
  }

  private createWinstonLogger(): winston.Logger {
    const isDevelopment = this.configService.get<string>("NODE_ENV") === "development";
    const logLevel = this.configService.get<string>("LOG_LEVEL") || (isDevelopment ? "debug" : "info");

    // Формат для консоли
    const consoleFormat = winston.format.combine(
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
        const contextStr = context ? `[${context}]` : "";
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : "";
        return `${timestamp} ${level} ${contextStr} ${message} ${metaStr}`;
      })
    );

    // Формат для файлов
    const fileFormat = winston.format.combine(
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.errors({ stack: true }),
      winston.format.json()
    );

    // Транспорты
    const transports: winston.transport[] = [
      // Консоль (всегда)
      new winston.transports.Console({
        level: logLevel,
        format: consoleFormat,
      }),
    ];

    // Файловые транспорты (только в production или если указано)
    if (this.configService.get<string>("ENABLE_FILE_LOGGING") === "true" || !isDevelopment) {
      // Общий лог
      transports.push(
        new DailyRotateFile({
          dirname: this.logDir,
          filename: "application-%DATE%.log",
          datePattern: "YYYY-MM-DD",
          zippedArchive: true,
          maxSize: "20m",
          maxFiles: "14d",
          format: fileFormat,
          level: logLevel,
        })
      );

      // Лог ошибок
      transports.push(
        new DailyRotateFile({
          dirname: this.logDir,
          filename: "error-%DATE%.log",
          datePattern: "YYYY-MM-DD",
          zippedArchive: true,
          maxSize: "20m",
          maxFiles: "30d",
          format: fileFormat,
          level: "error",
        })
      );

      // Лог HTTP запросов
      transports.push(
        new DailyRotateFile({
          dirname: this.logDir,
          filename: "http-%DATE%.log",
          datePattern: "YYYY-MM-DD",
          zippedArchive: true,
          maxSize: "20m",
          maxFiles: "7d",
          format: fileFormat,
          level: "info",
        })
      );
    }

    return winston.createLogger({
      level: logLevel,
      format: winston.format.combine(
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: {
        service: "masterprofi-backend",
        environment: this.configService.get<string>("NODE_ENV") || "development",
      },
      transports,
      exceptionHandlers: [
        new winston.transports.File({
          filename: join(this.logDir, "exceptions.log"),
        }),
      ],
      rejectionHandlers: [
        new winston.transports.File({
          filename: join(this.logDir, "rejections.log"),
        }),
      ],
    });
  }

  log(message: string, context?: string) {
    this.winstonLogger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.winstonLogger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    this.winstonLogger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.winstonLogger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.winstonLogger.verbose(message, { context });
  }

  // Дополнительные методы для структурированного логирования
  logWithMeta(message: string, meta: Record<string, any>, context?: string) {
    this.winstonLogger.info(message, { ...meta, context });
  }

  errorWithMeta(message: string, error: Error | any, context?: string) {
    const meta: Record<string, any> = {
      context,
      error: error?.message,
      stack: error?.stack,
    };

    if (error?.response) {
      meta.response = {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      };
    }

    if (error?.request) {
      meta.request = {
        method: error.request.method,
        url: error.request.url,
      };
    }

    this.winstonLogger.error(message, meta);
  }

  // Метод для бизнес-логики
  logBusinessEvent(event: string, data: Record<string, any>, context?: string) {
    this.winstonLogger.info(`[BUSINESS] ${event}`, {
      event,
      ...data,
      context: context || "business",
    });
  }

  // Метод для аудита безопасности
  logSecurityEvent(event: string, data: Record<string, any>) {
    this.winstonLogger.warn(`[SECURITY] ${event}`, {
      event,
      ...data,
      context: "security",
    });
  }
}

