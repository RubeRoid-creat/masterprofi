import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  HttpException,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CrmSyncService } from "./crm-sync.service";
import { CrmService } from "./crm.service";
import { SyncInitialDto } from "./dto/sync-initial.dto";
import { SyncIncrementalDto } from "./dto/sync-incremental.dto";
import { SyncOutgoingDto } from "./dto/sync-outgoing.dto";
import { GetChangesDto } from "./dto/get-changes.dto";
import { PushChangesDto } from "./dto/push-changes.dto";
import { SyncBatchDto } from "./dto/sync-batch.dto";
import { ResolveConflictDto } from "./dto/resolve-conflict.dto";
import { SyncPullDto } from "./dto/sync-pull.dto";
import { RegisterDeviceDto } from "./dto/register-device.dto";
import { DeviceService } from "./services/device.service";
import { Throttle } from "@nestjs/throttler";
import { UseInterceptors } from "@nestjs/common";
import { PayloadSizeInterceptor } from "./interceptors/payload-size.interceptor";
import { Request } from "express";

@ApiTags("CRM Sync")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("sync")
export class CrmController {
  constructor(
    private readonly crmSyncService: CrmSyncService,
    private readonly crmService: CrmService,
    private readonly deviceService: DeviceService
  ) {}

  @Get("initial")
  @ApiOperation({ summary: "Первоначальная загрузка данных" })
  @ApiResponse({ status: 200, description: "Данные успешно загружены" })
  async initialSync(@Query() dto: SyncInitialDto, @Req() req: Request) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new HttpException("User ID not found in request", HttpStatus.UNAUTHORIZED);
      }
      return await this.crmSyncService.initialSync(userId);
    } catch (error: any) {
      console.error("Error in initialSync controller:", error);
      throw new HttpException(
        error.message || "Failed to perform initial sync",
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("incremental")
  @ApiOperation({ summary: "Инкрементальная синхронизация" })
  @ApiResponse({ status: 200, description: "Изменения получены" })
  async incrementalSync(
    @Query() dto: SyncIncrementalDto,
    @Req() req: Request
  ) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new HttpException("User ID not found in request", HttpStatus.UNAUTHORIZED);
      }
      return await this.crmSyncService.incrementalSync(
        userId,
        dto.since ? new Date(dto.since) : undefined,
        dto.entityTypes
      );
    } catch (error: any) {
      console.error("Error in incrementalSync controller:", error);
      throw new HttpException(
        error.message || "Failed to perform incremental sync",
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("outgoing")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Отправка изменений из приложения" })
  @ApiResponse({ status: 200, description: "Изменения приняты" })
  async outgoingSync(@Body() dto: SyncOutgoingDto, @Req() req: Request) {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new Error("User ID not found in request");
    }
    return this.crmSyncService.processOutgoingChanges(userId, dto.changes);
  }

  @Get("status")
  @ApiOperation({ summary: "Статус синхронизации" })
  @ApiResponse({ status: 200, description: "Статус синхронизации" })
  async getSyncStatus(@Req() req: Request) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new HttpException("User ID not found in request", HttpStatus.UNAUTHORIZED);
      }
      return await this.crmSyncService.getSyncStatus(userId);
    } catch (error: any) {
      console.error("Error in getSyncStatus controller:", error);
      throw new HttpException(
        error.message || "Failed to get sync status",
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("pull")
  @Throttle({ default: { limit: 100, ttl: 60000 } }) // 100 запросов в минуту
  @ApiOperation({ 
    summary: "Получить изменения с сервера (Pull)",
    description: "Основной endpoint для получения изменений с сервера. Возвращает данные в формате согласно ТЗ."
  })
  @ApiResponse({ status: 200, description: "Изменения получены" })
  async pullChanges(@Query() dto: SyncPullDto, @Req() req: Request) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new HttpException("User ID not found in request", HttpStatus.UNAUTHORIZED);
      }

      // Обновляем активность устройства, если указан deviceId
      if (dto.deviceId) {
        try {
          await this.deviceService.updateLastActive(dto.deviceId, userId);
        } catch (error) {
          // Устройство не найдено - игнорируем, это не критично
        }
      }

      // Получаем изменения (полные данные для синхронизации)
      const result = await this.crmSyncService.getChanges(
        userId,
        dto.since ? new Date(dto.since) : undefined,
        dto.entityTypes
      );

      // Генерируем sync token
      const syncToken = await this.crmSyncService.generateSyncToken(userId);

      return {
        sync_batch: {
          batch_id: `batch-${Date.now()}`,
          device_id: dto.deviceId || null,
          changes: this.formatChangesForPull(result),
        },
        last_sync_timestamp: result.syncedAt || new Date().toISOString(),
        sync_token: syncToken,
        pending_changes_count: result.contacts + result.deals + result.tasks,
        conflicts: [], // Конфликты обрабатываются отдельно
      };
    } catch (error: any) {
      console.error("Error in pullChanges controller:", error);
      throw new HttpException(
        error.message || "Failed to pull changes",
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("changes")
  @ApiOperation({ 
    summary: "Получить изменения с сервера (legacy)",
    description: "Возвращает список изменений из таблицы sync_changes после указанного времени. Аналог Flask endpoint /api/sync/changes"
  })
  @ApiResponse({ status: 200, description: "Изменения получены" })
  async getChanges(@Query() dto: GetChangesDto, @Req() req: Request) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new HttpException("User ID not found in request", HttpStatus.UNAUTHORIZED);
      }
      
      // Если указан параметр full=true, возвращаем полные данные (incrementalSync)
      // Иначе возвращаем только список изменений (getChangesList)
      const full = (req.query as any).full === 'true';
      
      if (full) {
        return await this.crmSyncService.getChanges(
          userId,
          dto.since ? new Date(dto.since) : undefined,
          dto.entityTypes
        );
      } else {
        return await this.crmSyncService.getChangesList(
          userId,
          dto.since ? new Date(dto.since) : undefined,
          dto.entityTypes
        );
      }
    } catch (error: any) {
      console.error("Error in getChanges controller:", error);
      throw new HttpException(
        error.message || "Failed to get changes",
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("push")
  @Throttle({ default: { limit: 100, ttl: 60000 } }) // 100 запросов в минуту
  @UseInterceptors(PayloadSizeInterceptor)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: "Отправить локальные изменения на сервер",
    description: "Поддерживает как обычную отправку (PushChangesDto), так и отправку батчами (SyncBatchDto). Для батчей используйте поле batchId. Максимальный размер пакета: 1MB."
  })
  @ApiResponse({ status: 200, description: "Изменения приняты" })
  async pushChanges(@Body() dto: PushChangesDto | SyncBatchDto, @Req() req: Request) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new HttpException("User ID not found in request", HttpStatus.UNAUTHORIZED);
      }
      
      // Проверяем, является ли запрос батчем
      if ('batchId' in dto) {
        const batchDto = dto as SyncBatchDto;
        return await this.crmSyncService.pushBatch(userId, batchDto);
      } else {
        const pushDto = dto as PushChangesDto;
        return await this.crmSyncService.pushChanges(userId, pushDto.changes);
      }
    } catch (error: any) {
      console.error("Error in pushChanges controller:", error);
      throw new HttpException(
        error.message || "Failed to push changes",
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("resolve-conflict")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Разрешить конфликт синхронизации" })
  @ApiResponse({ status: 200, description: "Конфликт разрешен" })
  async resolveConflict(@Body() dto: ResolveConflictDto, @Req() req: Request) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new HttpException("User ID not found in request", HttpStatus.UNAUTHORIZED);
      }
      return await this.crmSyncService.resolveConflict(
        userId,
        dto.entityId,
        dto.entityType,
        dto.strategy as 'server_wins' | 'client_wins' | 'merge' | 'auto',
        dto.clientData,
        dto.clientVersion,
        dto.clientLastModified
      );
    } catch (error: any) {
      console.error("Error in resolveConflict controller:", error);
      throw new HttpException(
        error.message || "Failed to resolve conflict",
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("register-device")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Зарегистрировать устройство" })
  @ApiResponse({ status: 200, description: "Устройство зарегистрировано" })
  async registerDevice(@Body() dto: RegisterDeviceDto, @Req() req: Request) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new HttpException("User ID not found in request", HttpStatus.UNAUTHORIZED);
      }
      return await this.deviceService.registerDevice(userId, dto);
    } catch (error: any) {
      console.error("Error in registerDevice controller:", error);
      throw new HttpException(
        error.message || "Failed to register device",
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Форматировать изменения для pull endpoint согласно ТЗ
   */
  private formatChangesForPull(result: any): any[] {
    const changes: any[] = [];

    // Форматируем контакты
    if (result.data?.contacts) {
      for (const contact of result.data.contacts) {
        changes.push({
          entity: "contact",
          operation: "update", // или "create" в зависимости от ситуации
          entity_id: contact.id,
          data: contact.data || contact,
          timestamp: contact.metadata?.last_modified || new Date().toISOString(),
          version: contact.metadata?.version || 1,
        });
      }
    }

    // Форматируем сделки
    if (result.data?.deals) {
      for (const deal of result.data.deals) {
        changes.push({
          entity: "deal",
          operation: "update",
          entity_id: deal.id,
          data: deal.data || deal,
          timestamp: deal.metadata?.last_modified || new Date().toISOString(),
          version: deal.metadata?.version || 1,
        });
      }
    }

    // Форматируем задачи
    if (result.data?.tasks) {
      for (const task of result.data.tasks) {
        changes.push({
          entity: "task",
          operation: "update",
          entity_id: task.id,
          data: task.data || task,
          timestamp: task.metadata?.last_modified || new Date().toISOString(),
          version: task.metadata?.version || 1,
        });
      }
    }

    return changes;
  }

}

