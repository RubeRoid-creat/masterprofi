import {
  IsArray,
  IsString,
  IsBoolean,
  ValidateNested,
  IsOptional,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { PushChangeDto } from "./push-changes.dto";

export class SyncBatchDto {
  @ApiProperty({
    type: [PushChangeDto],
    description: "Массив изменений в батче (до 50 записей)",
    maxItems: 50,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PushChangeDto)
  changes: PushChangeDto[];

  @ApiProperty({
    description: "ID батча для отслеживания",
    example: "batch-123-456",
  })
  @IsString()
  batchId: string;

  @ApiProperty({
    description: "Является ли это последним батчем",
    required: false,
    default: false,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  lastBatch?: boolean;
}

