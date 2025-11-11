import { IsString, IsOptional, IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RegisterDeviceDto {
  @ApiProperty({ description: "Уникальный ID устройства" })
  @IsString()
  deviceId: string;

  @ApiProperty({ description: "Название устройства", required: false })
  @IsOptional()
  @IsString()
  deviceName?: string;

  @ApiProperty({ description: "Платформа", enum: ["ios", "android", "web"], required: false })
  @IsOptional()
  @IsEnum(["ios", "android", "web"])
  platform?: string;

  @ApiProperty({ description: "Версия приложения", required: false })
  @IsOptional()
  @IsString()
  appVersion?: string;

  @ApiProperty({ description: "Версия ОС", required: false })
  @IsOptional()
  @IsString()
  osVersion?: string;

  @ApiProperty({ description: "FCM токен для push-уведомлений", required: false })
  @IsOptional()
  @IsString()
  fcmToken?: string;

  @ApiProperty({ description: "Дополнительные метаданные", required: false })
  @IsOptional()
  metadata?: Record<string, any>;
}

