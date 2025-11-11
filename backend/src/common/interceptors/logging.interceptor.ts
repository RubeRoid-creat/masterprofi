import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { LoggerService } from "../../logger/logger.service";
import { MetricsService } from "../../metrics/metrics.service";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    private logger: LoggerService,
    private metrics: MetricsService
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip, headers } = request;
    const userAgent = headers["user-agent"] || "";
    const startTime = Date.now();

    // Увеличиваем счетчик активных запросов
    this.metrics.httpRequestInProgress.inc();

    const route = this.getRoute(context);

    return next.handle().pipe(
      tap({
        next: (data) => {
          const response = context.switchToHttp().getResponse();
          const statusCode = response.statusCode;
          const duration = (Date.now() - startTime) / 1000;

          // Метрики
          this.metrics.httpRequestDuration.observe(
            { method, route, status_code: statusCode.toString() },
            duration
          );
          this.metrics.httpRequestTotal.inc({
            method,
            route,
            status_code: statusCode.toString(),
          });

          // Уменьшаем счетчик активных запросов
          this.metrics.httpRequestInProgress.dec();

          // Логирование
          if (statusCode >= 400) {
            this.logger.warn(
              `${method} ${url} ${statusCode} ${duration.toFixed(3)}s`,
              context.getClass().name
            );
          } else {
            this.logger.log(
              `${method} ${url} ${statusCode} ${duration.toFixed(3)}s`,
              context.getClass().name
            );
          }

          // Структурированное логирование для HTTP логов
          this.logger.logWithMeta(
            "HTTP Request",
            {
              method,
              url,
              route,
              statusCode,
              duration,
              ip,
              userAgent,
              userId: request.user?.id || request.user?.userId || null,
            },
            "HTTP"
          );
        },
        error: (error) => {
          const response = context.switchToHttp().getResponse();
          const statusCode = error.status || response.statusCode || 500;
          const duration = (Date.now() - startTime) / 1000;

          // Метрики ошибок
          this.metrics.httpRequestDuration.observe(
            { method, route, status_code: statusCode.toString() },
            duration
          );
          this.metrics.httpRequestTotal.inc({
            method,
            route,
            status_code: statusCode.toString(),
          });
          this.metrics.errorsTotal.inc({
            error_type: "http",
            context: route,
          });

          // Уменьшаем счетчик активных запросов
          this.metrics.httpRequestInProgress.dec();

          // Логирование ошибки
          this.logger.errorWithMeta(
            `${method} ${url} ${statusCode} ${duration.toFixed(3)}s - ${error.message}`,
            error,
            context.getClass().name
          );
        },
      })
    );
  }

  private getRoute(context: ExecutionContext): string {
    const handler = context.getHandler();
    const controller = context.getClass();
    const route = Reflect.getMetadata("path", handler) || "";
    const controllerPath = Reflect.getMetadata("path", controller) || "";
    return `${controllerPath}${route}`.replace(/\/+/g, "/") || "unknown";
  }
}

