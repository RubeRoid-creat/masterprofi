import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsDateString, IsEnum, IsString, ValidateIf } from "class-validator";
import { OrderStatus } from "../../orders/entities/order.entity";
import { PaymentStatus } from "../../payments/entities/payment.entity";

export class GenerateOrdersReportDto {
  @ApiProperty({ required: false, description: "Начальная дата" })
  @IsOptional()
  @ValidateIf((o) => o.startDate !== undefined && o.startDate !== "")
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false, description: "Конечная дата" })
  @IsOptional()
  @ValidateIf((o) => o.endDate !== undefined && o.endDate !== "")
  @IsDateString()
  endDate?: string;

  @ApiProperty({ required: false, enum: OrderStatus, description: "Статус заказа" })
  @IsOptional()
  @ValidateIf((o) => o.status !== undefined && o.status !== "")
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiProperty({ required: false, description: "ID клиента" })
  @IsOptional()
  @ValidateIf((o) => o.clientId !== undefined && o.clientId !== "")
  @IsString()
  clientId?: string;

  @ApiProperty({ required: false, description: "ID мастера" })
  @IsOptional()
  @ValidateIf((o) => o.masterId !== undefined && o.masterId !== "")
  @IsString()
  masterId?: string;
}

export class GenerateMLMReportDto {
  @ApiProperty({ required: false, description: "Начальная дата" })
  @IsOptional()
  @ValidateIf((o) => o.startDate !== undefined && o.startDate !== "")
  @IsDateString({}, { message: "Дата должна быть в формате ISO" })
  startDate?: string;

  @ApiProperty({ required: false, description: "Конечная дата" })
  @IsOptional()
  @ValidateIf((o) => o.endDate !== undefined && o.endDate !== "")
  @IsDateString({}, { message: "Дата должна быть в формате ISO" })
  endDate?: string;

  @ApiProperty({ required: false, description: "ID мастера" })
  @IsOptional()
  @ValidateIf((o) => o.masterId !== undefined && o.masterId !== "")
  @IsString()
  masterId?: string;
}

export class GenerateFinancialReportDto {
  @ApiProperty({ required: false, description: "Начальная дата" })
  @IsOptional()
  @ValidateIf((o) => o.startDate !== undefined && o.startDate !== "")
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false, description: "Конечная дата" })
  @IsOptional()
  @ValidateIf((o) => o.endDate !== undefined && o.endDate !== "")
  @IsDateString()
  endDate?: string;

  @ApiProperty({ required: false, enum: PaymentStatus, description: "Статус платежа" })
  @IsOptional()
  @ValidateIf((o) => o.paymentStatus !== undefined && o.paymentStatus !== "")
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;
}

