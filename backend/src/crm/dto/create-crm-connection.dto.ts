import {
  IsEnum,
  IsString,
  IsOptional,
  IsUrl,
  IsObject,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CrmType } from "../entities/crm-connection.entity";

export class CreateCrmConnectionDto {
  @ApiProperty({ enum: CrmType, description: "Тип CRM системы" })
  @IsEnum(CrmType)
  crmType: CrmType;

  @ApiPropertyOptional({ description: "URL API (для Bitrix24)" })
  @IsOptional()
  @IsUrl()
  apiUrl?: string;

  @ApiPropertyOptional({ description: "Client ID для OAuth" })
  @IsOptional()
  @IsString()
  clientId?: string;

  @ApiPropertyOptional({ description: "Client Secret для OAuth" })
  @IsOptional()
  @IsString()
  clientSecret?: string;

  @ApiPropertyOptional({ description: "Код авторизации (для первого подключения)" })
  @IsOptional()
  @IsString()
  authorizationCode?: string;

  @ApiPropertyOptional({ description: "Дополнительные настройки" })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}





