import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

export class ChangePasswordDto {
  @ApiProperty({ description: "Текущий пароль" })
  @IsString()
  @MinLength(6)
  currentPassword: string;

  @ApiProperty({ description: "Новый пароль" })
  @IsString()
  @MinLength(6)
  newPassword: string;
}







