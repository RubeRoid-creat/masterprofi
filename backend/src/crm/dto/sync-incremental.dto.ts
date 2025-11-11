import { IsOptional, IsDateString } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class SyncIncrementalDto {
  @ApiPropertyOptional({
    description: "Timestamp последней синхронизации",
    example: "2024-01-15T10:30:00Z",
  })
  @IsOptional()
  @IsDateString()
  since?: string;

  @ApiPropertyOptional({
    description: "Типы сущностей для синхронизации",
    example: ["contacts", "deals", "tasks"],
  })
  @IsOptional()
  entityTypes?: string[];
}

