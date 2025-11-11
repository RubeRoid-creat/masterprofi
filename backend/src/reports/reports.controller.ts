import {
  Controller,
  Post,
  Body,
  UseGuards,
  Res,
  HttpStatus,
  Get,
  Query,
} from "@nestjs/common";
import { Response } from "express";
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ReportsService } from "./reports.service";
import { ExportService, ExportFormat } from "./export.service";
import { ExportDataDto } from "./dto/export-data.dto";
import {
  GenerateOrdersReportDto,
  GenerateMLMReportDto,
  GenerateFinancialReportDto,
} from "./dto/generate-report.dto";

@ApiTags("Reports")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("reports")
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly exportService: ExportService
  ) {}

  @Post("orders")
  @ApiOperation({ summary: "Генерация отчета по заказам в PDF" })
  @ApiResponse({ status: 200, description: "PDF файл отчета" })
  async generateOrdersReport(
    @Body() dto: GenerateOrdersReportDto,
    @Res() res: Response
  ) {
    try {
      const filters = {
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        status: dto.status,
        clientId: dto.clientId,
        masterId: dto.masterId,
      };

      const pdfBuffer = await this.reportsService.generateOrdersReport(filters);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="orders_report_${new Date().toISOString().split("T")[0]}.pdf"`
      );

      return res.send(pdfBuffer);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: "Ошибка генерации отчета",
        error: error.message,
      });
    }
  }

  @Post("mlm")
  @ApiOperation({ summary: "Генерация отчета по MLM в PDF" })
  @ApiResponse({ status: 200, description: "PDF файл отчета" })
  async generateMLMReport(
    @Body() dto: GenerateMLMReportDto,
    @Res() res: Response
  ) {
    try {
      const filters = {
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        masterId: dto.masterId,
      };

      const pdfBuffer = await this.reportsService.generateMLMReport(filters);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="mlm_report_${new Date().toISOString().split("T")[0]}.pdf"`
      );

      return res.send(pdfBuffer);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: "Ошибка генерации отчета",
        error: error.message,
      });
    }
  }

  @Post("financial")
  @ApiOperation({ summary: "Генерация финансового отчета в PDF" })
  @ApiResponse({ status: 200, description: "PDF файл отчета" })
  async generateFinancialReport(
    @Body() dto: GenerateFinancialReportDto,
    @Res() res: Response
  ) {
    try {
      const filters = {
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        paymentStatus: dto.paymentStatus,
      };

      const pdfBuffer = await this.reportsService.generateFinancialReport(filters);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="financial_report_${new Date().toISOString().split("T")[0]}.pdf"`
      );

      return res.send(pdfBuffer);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: "Ошибка генерации отчета",
        error: error.message,
      });
    }
  }

  @Post("export")
  @ApiOperation({ summary: "Экспорт данных в Excel/CSV" })
  @ApiResponse({ status: 200, description: "Файл экспорта" })
  async exportData(@Body() dto: ExportDataDto, @Res() res: Response) {
    try {
      const options = {
        format: dto.format,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        entityType: dto.entityType,
        filters: dto.filters,
      };

      let buffer: Buffer;
      let filename: string;
      let contentType: string;

      if (dto.format === ExportFormat.EXCEL) {
        if (dto.entityType === "all") {
          buffer = await this.exportService.exportAllData(options);
          filename = `export_all_${new Date().toISOString().split("T")[0]}.xlsx`;
        } else {
          const orders = await this.exportService["getOrders"](options);
          buffer = await this.exportService.exportOrdersToExcel(orders);
          filename = `export_orders_${new Date().toISOString().split("T")[0]}.xlsx`;
        }
        contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      } else if (dto.format === ExportFormat.CSV) {
        const orders = await this.exportService["getOrders"](options);
        const csvContent = await this.exportService.exportOrdersToCSV(orders);
        buffer = Buffer.from(csvContent, "utf-8");
        filename = `export_orders_${new Date().toISOString().split("T")[0]}.csv`;
        contentType = "text/csv";
      } else {
        throw new Error("Unsupported format");
      }

      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      return res.send(buffer);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: "Ошибка экспорта данных",
        error: error.message,
      });
    }
  }

  @Post("export/orders")
  @ApiOperation({ summary: "Экспорт заказов в Excel" })
  @ApiResponse({ status: 200, description: "Excel файл" })
  async exportOrdersExcel(@Body() dto: GenerateOrdersReportDto, @Res() res: Response) {
    try {
      const options = {
        format: ExportFormat.EXCEL,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        entityType: "orders" as const,
        filters: { status: dto.status, clientId: dto.clientId, masterId: dto.masterId },
      };

      const orders = await this.exportService["getOrders"](options);
      const buffer = await this.exportService.exportOrdersToExcel(orders);

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="orders_${new Date().toISOString().split("T")[0]}.xlsx"`
      );
      return res.send(buffer);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: "Ошибка экспорта",
        error: error.message,
      });
    }
  }

  @Get("export/orders/csv")
  @ApiOperation({ summary: "Экспорт заказов в CSV" })
  @ApiResponse({ status: 200, description: "CSV файл" })
  async exportOrdersCSV(
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("status") status?: string,
    @Res() res?: Response
  ) {
    try {
      const options = {
        format: ExportFormat.CSV,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        entityType: "orders" as const,
        filters: { status },
      };

      const orders = await this.exportService["getOrders"](options);
      const csvContent = await this.exportService.exportOrdersToCSV(orders);

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="orders_${new Date().toISOString().split("T")[0]}.csv"`
      );
      return res.send(Buffer.from(csvContent, "utf-8"));
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: "Ошибка экспорта",
        error: error.message,
      });
    }
  }
}

