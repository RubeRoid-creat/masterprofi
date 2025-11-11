import {
  IsArray,
  IsEnum,
  IsString,
  IsUUID,
  IsObject,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { SyncOperation } from "../entities/sync-queue.entity";

export class OutgoingChangeDto {
  @ApiProperty({ description: "ID сущности" })
  @IsUUID()
  entityId: string;

  @ApiProperty({ description: "Тип сущности" })
  @IsString()
  entityType: string;

  @ApiProperty({ description: "Операция", enum: SyncOperation })
  @IsEnum(SyncOperation)
  operation: SyncOperation;

  @ApiProperty({ description: "Данные сущности" })
  @IsObject()
  payload: Record<string, any>;
}

export class SyncOutgoingDto {
  @ApiProperty({
    type: [OutgoingChangeDto],
    description: "Массив изменений для отправки",
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OutgoingChangeDto)
  changes: OutgoingChangeDto[];
}





