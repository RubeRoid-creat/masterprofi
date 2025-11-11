import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { MetricsService } from "../../metrics/metrics.service";

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  constructor(private metrics: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const handler = context.getHandler();
    const controller = context.getClass();
    
    const handlerName = handler.name;
    const controllerName = controller.name;

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = (Date.now() - startTime) / 1000;
          
          // Логируем медленные операции (>1 секунды)
          if (duration > 1) {
            console.warn(
              `[PERFORMANCE] Slow operation: ${controllerName}.${handlerName} took ${duration.toFixed(3)}s`
            );
          }

          // Можно добавить метрику для времени выполнения методов
          // this.metrics.methodDuration.observe({ controller: controllerName, handler: handlerName }, duration);
        },
        error: () => {
          const duration = (Date.now() - startTime) / 1000;
          console.error(
            `[PERFORMANCE] Failed operation: ${controllerName}.${handlerName} took ${duration.toFixed(3)}s`
          );
        },
      })
    );
  }
}

