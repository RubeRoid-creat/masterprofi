import { Controller, Get, Post, Put, Body, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AlertsService, AlertRule } from "./alerts.service";

@ApiTags("Alerts")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("alerts")
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get("history")
  @ApiOperation({ summary: "Get alert history" })
  @ApiResponse({ status: 200, description: "Returns alert history" })
  getAlertHistory(@Param("limit") limit?: number) {
    return this.alertsService.getAlertHistory(limit);
  }

  @Get("rules")
  @ApiOperation({ summary: "Get all alert rules" })
  @ApiResponse({ status: 200, description: "Returns all alert rules" })
  getAlertRules(): AlertRule[] {
    return this.alertsService.getAlertRules();
  }

  @Post("rules")
  @ApiOperation({ summary: "Add new alert rule" })
  @ApiResponse({ status: 201, description: "Alert rule added" })
  addAlertRule(@Body() rule: AlertRule) {
    this.alertsService.addAlertRule(rule);
    return { message: "Alert rule added", rule };
  }

  @Put("rules/:name")
  @ApiOperation({ summary: "Update alert rule" })
  @ApiResponse({ status: 200, description: "Alert rule updated" })
  updateAlertRule(@Param("name") name: string, @Body() updates: Partial<AlertRule>) {
    const success = this.alertsService.updateAlertRule(name, updates);
    if (success) {
      return { message: "Alert rule updated" };
    }
    return { message: "Alert rule not found" };
  }

  @Post("rules/:name/toggle")
  @ApiOperation({ summary: "Enable/disable alert rule" })
  @ApiResponse({ status: 200, description: "Alert rule toggled" })
  toggleAlertRule(@Param("name") name: string, @Body() body: { enabled: boolean }) {
    const success = this.alertsService.toggleAlertRule(name, body.enabled);
    if (success) {
      return { message: `Alert rule ${body.enabled ? "enabled" : "disabled"}` };
    }
    return { message: "Alert rule not found" };
  }

  @Post("check")
  @ApiOperation({ summary: "Manually trigger alert check" })
  @ApiResponse({ status: 200, description: "Alert check triggered" })
  async checkAlerts() {
    await this.alertsService.checkAlerts();
    return { message: "Alert check completed" };
  }
}

