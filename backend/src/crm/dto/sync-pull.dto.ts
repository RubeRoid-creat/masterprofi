import { IsOptional, IsString, IsArray } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SyncPullDto {
  @ApiProperty({
    description: "Дата последней синхронизации (ISO string)",
    required: false,
    example: "2024-01-15T12:00:00Z",
  })
  @IsOptional()
  @IsString()
  since?: string;

  @ApiProperty({
    description: "Типы сущностей для синхронизации",
    required: false,
    example: ["contact", "deal"],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  entityTypes?: string[];

  @ApiProperty({
    description: "Sync token для инкрементальной синхронизации",
    required: false,
  })
  @IsOptional()
  @IsString()
  syncToken?: string;

  @ApiProperty({
    description: "ID устройства",
    required: false,
  })
  @IsOptional()
  @IsString()
  deviceId?: string;
}

