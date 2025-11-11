import { SetMetadata } from "@nestjs/common";
import { AuditAction } from "../entities/audit-log.entity";

export const AUDIT_ACTION_KEY = "audit_action";
export const AUDIT_ENTITY_TYPE_KEY = "audit_entity_type";

export const Audit = (action: AuditAction, entityType?: string) => {
  return (
    target: any,
    propertyKey?: string,
    descriptor?: PropertyDescriptor
  ) => {
    SetMetadata(AUDIT_ACTION_KEY, action)(target, propertyKey, descriptor);
    if (entityType) {
      SetMetadata(AUDIT_ENTITY_TYPE_KEY, entityType)(
        target,
        propertyKey,
        descriptor
      );
    }
  };
};
