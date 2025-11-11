import { IsEmail, IsString, IsOptional, IsBoolean } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @ApiProperty({ example: "user@example.com", required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: "+79991234567", required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: "user@example.com or +79991234567", required: false })
  @IsOptional()
  @IsString()
  emailOrPhone?: string;

  @ApiProperty({ example: "password123" })
  @IsString()
  password: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}
