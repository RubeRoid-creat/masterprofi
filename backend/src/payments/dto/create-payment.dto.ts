import { IsString, IsNumber, IsOptional, IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { PaymentType, PaymentStatus } from "../entities/payment.entity";

export class CreatePaymentDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty({ enum: PaymentType, default: PaymentType.ORDER_PAYMENT })
  @IsEnum(PaymentType)
  @IsOptional()
  type?: PaymentType;

  @ApiProperty({ enum: PaymentStatus, default: PaymentStatus.PENDING })
  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;

  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty({ required: false, default: "RUB" })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  orderId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  transactionId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  gateway?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  gatewayData?: string;
}
