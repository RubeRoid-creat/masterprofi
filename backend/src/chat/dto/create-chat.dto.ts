import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class CreateChatDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsString()
  @IsNotEmpty()
  clientId: string;

  @IsString()
  @IsOptional()
  masterId?: string;
}


