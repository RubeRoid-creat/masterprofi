import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";
import { LoggerService } from "../../logger/logger.service";
import { MetricsService } from "../../metrics/metrics.service";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private logger: LoggerService,
    private metrics: MetricsService
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : exception instanceof Error
        ? exception.message
        : "Internal server error";

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message:
        typeof message === "string"
          ? message
          : (message as any)?.message || "Internal server error",
      ...(process.env.NODE_ENV === "development" && {
        stack: exception instanceof Error ? exception.stack : undefined,
      }),
    };

    // Логирование ошибки
    // 401 и 403 - это нормальные ошибки авторизации, не логируем их как критические
    if (status >= 500) {
      // Критические ошибки сервера
      this.logger.errorWithMeta(
        `HTTP ${status} ${request.method} ${request.url}`,
        exception instanceof Error ? exception : new Error(String(exception)),
        "HttpExceptionFilter"
      );
    } else if (status === 401 || status === 403) {
      // Ошибки авторизации - логируем на уровне warning, не error
      this.logger.warn(
        `HTTP ${status} ${request.method} ${request.url} - ${typeof message === "string" ? message : (message as any)?.message || "Unauthorized"}`,
        "HttpExceptionFilter"
      );
    } else {
      // Другие клиентские ошибки (400, 404, etc.)
      this.logger.warn(
        `HTTP ${status} ${request.method} ${request.url}`,
        "HttpExceptionFilter"
      );
    }

    // Метрики - учитываем все ошибки
    this.metrics.errorsTotal.inc({
      error_type: status >= 500 ? "server_error" : "client_error",
      context: request.route?.path || "unknown",
    });

    if (exception instanceof Error) {
      this.metrics.errorsByType.inc({
        error_class: exception.constructor.name,
      });
    }

    response.status(status).json(errorResponse);
  }
}

