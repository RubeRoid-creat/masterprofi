import { IsNumber, IsString, IsOptional, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateYooKassaPaymentDto {
  @ApiProperty({ description: "Сумма платежа в рублях" })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ description: "Описание платежа" })
  @IsString()
  description: string;

  @ApiProperty({ description: "ID пользователя" })
  @IsString()
  userId: string;

  @ApiProperty({ description: "ID заказа (опционально)", required: false })
  @IsString()
  @IsOptional()
  orderId?: string;

  @ApiProperty({
    description: "URL для возврата после оплаты (опционально)",
    required: false,
  })
  @IsString()
  @IsOptional()
  returnUrl?: string;
}

