import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { AuditService } from "../audit.service";
import {
  AUDIT_ACTION_KEY,
  AUDIT_ENTITY_TYPE_KEY,
} from "../decorators/audit.decorator";
import { AuditAction } from "../entities/audit-log.entity";

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private auditService: AuditService
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const action = this.reflector.get<AuditAction>(
      AUDIT_ACTION_KEY,
      context.getHandler()
    );
    const entityType = this.reflector.get<string>(
      AUDIT_ENTITY_TYPE_KEY,
      context.getHandler()
    );

    if (!action) {
      return next.handle();
    }

    const user = request.user;
    const ipAddress = request.ip || request.socket?.remoteAddress;
    const userAgent = request.get?.("user-agent");

    return next.handle().pipe(
      tap(async (response) => {
        try {
          const entityId =
            request.params?.id || request.body?.id || response?.id || null;

          await this.auditService.log(action, entityType || "unknown", {
            userId: user?.userId || user?.sub || null,
            entityId: entityId ? String(entityId) : undefined,
            description: `${action} performed`,
            newValues: response ? { id: entityId } : undefined,
            ipAddress,
            userAgent,
          });
        } catch (error) {
          console.error("Audit log error:", error);
        }
      })
    );
  }
}
