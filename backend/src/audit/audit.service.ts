import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuditLog, AuditAction } from "./entities/audit-log.entity";

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>
  ) {}

  async log(
    action: AuditAction,
    entityType: string,
    options: {
      userId?: string;
      entityId?: string;
      description?: string;
      oldValues?: Record<string, any>;
      newValues?: Record<string, any>;
      ipAddress?: string;
      userAgent?: string;
    }
  ): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create({
      action,
      entityType,
      userId: options.userId,
      entityId: options.entityId,
      description: options.description,
      oldValues: options.oldValues,
      newValues: options.newValues,
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
    });

    return this.auditLogRepository.save(auditLog);
  }

  async findByUserId(userId: string, limit: number = 50) {
    return this.auditLogRepository.find({
      where: { userId },
      order: { createdAt: "DESC" },
      take: limit,
    });
  }

  async findByEntity(entityType: string, entityId: string) {
    return this.auditLogRepository.find({
      where: { entityType, entityId },
      order: { createdAt: "DESC" },
      relations: ["user"],
    });
  }

  async findAll(limit: number = 100) {
    return this.auditLogRepository.find({
      order: { createdAt: "DESC" },
      take: limit,
      relations: ["user"],
    });
  }
}
