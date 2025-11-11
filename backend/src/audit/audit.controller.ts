import { Controller, Get, Param, UseGuards, Query } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AuditService } from "./audit.service";

@ApiTags("Audit")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("audit")
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: "Get audit logs" })
  async findAll(@Query("limit") limit?: string) {
    return this.auditService.findAll(limit ? parseInt(limit) : 100);
  }

  @Get("user/:userId")
  @ApiOperation({ summary: "Get audit logs by user ID" })
  async findByUserId(
    @Param("userId") userId: string,
    @Query("limit") limit?: string
  ) {
    return this.auditService.findByUserId(userId, limit ? parseInt(limit) : 50);
  }

  @Get("entity/:entityType/:entityId")
  @ApiOperation({ summary: "Get audit logs by entity" })
  async findByEntity(
    @Param("entityType") entityType: string,
    @Param("entityId") entityId: string
  ) {
    return this.auditService.findByEntity(entityType, entityId);
  }
}
