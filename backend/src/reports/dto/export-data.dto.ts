import { IsEnum, IsOptional, IsDateString, IsObject } from "class-validator";
import { ExportFormat } from "../export.service";

export class ExportDataDto {
  @IsEnum(ExportFormat)
  format: ExportFormat;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsEnum(["orders", "payments", "users", "mlm", "all"])
  entityType: "orders" | "payments" | "users" | "mlm" | "all";

  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;
}

