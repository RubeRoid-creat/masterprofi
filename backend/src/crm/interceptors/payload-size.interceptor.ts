import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  PayloadTooLargeException,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { Request } from "express";

/**
 * Interceptor для проверки размера payload
 * Максимальный размер: 1MB (согласно ТЗ)
 */
@Injectable()
export class PayloadSizeInterceptor implements NestInterceptor {
  private readonly maxSizeBytes = 1024 * 1024; // 1MB

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Получаем Content-Length из заголовков
    const contentLength = request.headers["content-length"];
    if (contentLength) {
      const size = parseInt(contentLength, 10);
      if (size > this.maxSizeBytes) {
        throw new PayloadTooLargeException(
          `Payload size exceeds maximum of ${this.maxSizeBytes / 1024 / 1024}MB. Received: ${(size / 1024 / 1024).toFixed(2)}MB`
        );
      }
    }

    // Также проверяем размер JSON body после парсинга
    if (request.body && typeof request.body === "object") {
      const bodySize = JSON.stringify(request.body).length;
      if (bodySize > this.maxSizeBytes) {
        throw new PayloadTooLargeException(
          `Payload size exceeds maximum of ${this.maxSizeBytes / 1024 / 1024}MB. Received: ${(bodySize / 1024 / 1024).toFixed(2)}MB`
        );
      }
    }

    return next.handle();
  }
}

