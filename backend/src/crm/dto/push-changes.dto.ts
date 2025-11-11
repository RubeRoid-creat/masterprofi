import {
  IsArray,
  IsEnum,
  IsString,
  IsUUID,
  IsObject,
  ValidateNested,
  IsOptional,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { SyncOperation } from "../entities/sync-queue.entity";

export class PushChangeDto {
  @ApiProperty({ description: "ID сущности" })
  @IsUUID()
  entityId: string;

  @ApiProperty({ description: "Тип сущности", example: "contact" })
  @IsString()
  entityType: string;

  @ApiProperty({ description: "Операция", enum: SyncOperation })
  @IsEnum(SyncOperation)
  operation: SyncOperation;

  @ApiProperty({ description: "Данные сущности" })
  @IsObject()
  payload: Record<string, any>;

  @ApiProperty({ description: "Версия сущности", required: false })
  @IsOptional()
  version?: number;

  @ApiProperty({ description: "Время последнего изменения", required: false })
  @IsOptional()
  @IsString()
  lastModified?: string;
}

export class PushChangesDto {
  @ApiProperty({
    type: [PushChangeDto],
    description: "Массив изменений для отправки",
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PushChangeDto)
  changes: PushChangeDto[];
}

