import { IsString, IsOptional, IsEmail, IsPhoneNumber, IsObject } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateCustomerDto {
  @ApiProperty({ description: "Имя клиента" })
  @IsString()
  firstName: string;

  @ApiProperty({ description: "Фамилия клиента" })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ description: "Email клиента" })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: "Телефон клиента" })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: "Название компании" })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({ description: "ИНН компании" })
  @IsOptional()
  @IsString()
  taxId?: string;

  @ApiPropertyOptional({ description: "Дополнительная информация" })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}





