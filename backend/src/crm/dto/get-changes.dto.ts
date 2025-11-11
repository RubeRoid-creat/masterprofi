import { IsOptional, IsString, IsArray } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class GetChangesDto {
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
    description: "Возвращать полные данные сущностей (true) или только список изменений (false)",
    required: false,
    default: false,
    example: false,
  })
  @IsOptional()
  @IsString()
  full?: string; // Используем string для query параметра, потом преобразуем в boolean
}

