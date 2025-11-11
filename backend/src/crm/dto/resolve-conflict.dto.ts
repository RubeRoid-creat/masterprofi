import {
  IsString,
  IsUUID,
  IsEnum,
  IsObject,
  IsOptional,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export enum ConflictResolutionStrategy {
  AUTO = "auto", // Автоматическое разрешение на основе версий и времени
  SERVER_WINS = "server_wins", // Использовать версию с сервера
  CLIENT_WINS = "client_wins", // Использовать версию клиента
  MERGE = "merge", // Объединить изменения
}

export class ResolveConflictDto {
  @ApiProperty({ description: "ID сущности с конфликтом" })
  @IsUUID()
  entityId: string;

  @ApiProperty({ description: "Тип сущности", example: "contact" })
  @IsString()
  entityType: string;

  @ApiProperty({
    description: "Стратегия разрешения конфликта",
    enum: ConflictResolutionStrategy,
  })
  @IsEnum(ConflictResolutionStrategy)
  strategy: ConflictResolutionStrategy;

  @ApiProperty({
    description: "Данные клиента (если используется merge)",
    required: false,
  })
  @IsOptional()
  @IsObject()
  clientData?: Record<string, any>;

  @ApiProperty({
    description: "Версия клиента",
    required: false,
  })
  @IsOptional()
  clientVersion?: number;

  @ApiProperty({
    description: "Время последнего изменения клиента (ISO string)",
    required: false,
    example: "2024-01-15T12:00:00Z",
  })
  @IsOptional()
  @IsString()
  clientLastModified?: string;
}

