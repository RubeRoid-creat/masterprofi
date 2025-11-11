import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsEmail, IsPhoneNumber } from "class-validator";

export class UpdateProfileDto {
  @ApiProperty({ required: false, description: "Email пользователя" })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false, description: "Имя" })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ required: false, description: "Фамилия" })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ required: false, description: "Телефон" })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false, description: "URL аватара" })
  @IsOptional()
  @IsString()
  avatar?: string;
}







