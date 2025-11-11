import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LoggerService } from "../logger/logger.service";
import { MetricsService } from "../metrics/metrics.service";

export interface AlertConfig {
  enabled: boolean;
  threshold: number;
  duration?: number; // В секундах
  cooldown?: number; // В секундах (время между алертами)
}

export interface AlertRule {
  name: string;
  metric: string;
  condition: "gt" | "lt" | "eq"; // greater than, less than, equal
  threshold: number;
  duration?: number;
  severity: "critical" | "warning" | "info";
  enabled: boolean;
  lastTriggered?: Date;
  cooldown: number; // В секундах
}

@Injectable()
export class AlertsService {
  private alertRules: AlertRule[] = [];
  private alertHistory: Array<{
    rule: string;
    severity: string;
    message: string;
    timestamp: Date;
  }> = [];

  constructor(
    private logger: LoggerService,
    private metrics: MetricsService,
    private configService: ConfigService
  ) {
    this.initializeDefaultRules();
  }

  private initializeDefaultRules() {
    this.alertRules = [
      {
        name: "high_error_rate",
        metric: "masterprofi_errors_total",
        condition: "gt",
        threshold: 10, // Более 10 ошибок за минуту
        duration: 60,
        severity: "critical",
        enabled: true,
        cooldown: 300, // 5 минут
      },
      {
        name: "high_response_time",
        metric: "masterprofi_http_request_duration_seconds",
        condition: "gt",
        threshold: 5, // Более 5 секунд
        duration: 60,
        severity: "warning",
        enabled: true,
        cooldown: 600, // 10 минут
      },
      {
        name: "low_cache_hit_rate",
        metric: "masterprofi_cache_misses_total",
        condition: "gt",
        threshold: 1000, // Более 1000 промахов за минуту
        duration: 60,
        severity: "warning",
        enabled: true,
        cooldown: 600,
      },
      {
        name: "database_connection_issues",
        metric: "masterprofi_db_queries_total",
        condition: "gt",
        threshold: 500, // Более 500 запросов за минуту (может указывать на проблему)
        duration: 60,
        severity: "warning",
        enabled: true,
        cooldown: 300,
      },
      {
        name: "auth_failure_spike",
        metric: "masterprofi_auth_failures_total",
        condition: "gt",
        threshold: 20, // Более 20 неудачных попыток за минуту
        duration: 60,
        severity: "critical",
        enabled: true,
        cooldown: 180, // 3 минуты
      },
    ];
  }

  /**
   * Проверить все правила алертов
   */
  async checkAlerts(): Promise<void> {
    for (const rule of this.alertRules) {
      if (!rule.enabled) continue;

      // Проверяем cooldown
      if (rule.lastTriggered) {
        const timeSinceLastTrigger = Date.now() - rule.lastTriggered.getTime();
        if (timeSinceLastTrigger < rule.cooldown * 1000) {
          continue; // Пропускаем, т.к. еще в cooldown
        }
      }

      try {
        const shouldAlert = await this.evaluateRule(rule);
        if (shouldAlert) {
          await this.triggerAlert(rule);
        }
      } catch (error) {
        this.logger.error(`Error checking alert rule ${rule.name}`, error?.stack, "AlertsService");
      }
    }
  }

  /**
   * Оценить правило алерта
   */
  private async evaluateRule(rule: AlertRule): Promise<boolean> {
    // В реальном сценарии здесь нужно получать метрики из Prometheus
    // Для упрощения используем внутренние счетчики
    // В production нужно интегрироваться с Prometheus AlertManager
    
    // TODO: Интеграция с Prometheus для получения реальных значений метрик
    
    return false; // Заглушка - в production здесь будет реальная логика
  }

  /**
   * Активировать алерт
   */
  private async triggerAlert(rule: AlertRule): Promise<void> {
    rule.lastTriggered = new Date();

    const message = this.buildAlertMessage(rule);
    
    // Логируем алерт
    if (rule.severity === "critical") {
      this.logger.errorWithMeta(`[ALERT] ${rule.name}: ${message}`, { rule }, "AlertsService");
    } else if (rule.severity === "warning") {
      this.logger.warn(`[ALERT] ${rule.name}: ${message}`, "AlertsService");
    } else {
      this.logger.log(`[ALERT] ${rule.name}: ${message}`, "AlertsService");
    }

    // Сохраняем в историю
    this.alertHistory.push({
      rule: rule.name,
      severity: rule.severity,
      message,
      timestamp: new Date(),
    });

    // Отправляем уведомления
    await this.sendNotifications(rule, message);

    // Обновляем метрики
    this.metrics.errorsTotal.inc({ error_type: "alert", context: rule.name });
  }

  private buildAlertMessage(rule: AlertRule): string {
    return `Alert "${rule.name}": ${rule.metric} ${this.getConditionSymbol(rule.condition)} ${rule.threshold}${rule.duration ? ` (over ${rule.duration}s)` : ""}`;
  }

  private getConditionSymbol(condition: string): string {
    switch (condition) {
      case "gt":
        return ">";
      case "lt":
        return "<";
      case "eq":
        return "=";
      default:
        return "?";
    }
  }

  /**
   * Отправить уведомления об алерте
   */
  private async sendNotifications(rule: AlertRule, message: string): Promise<void> {
    const alertConfig = {
      email: this.configService.get<string>("ALERTS_EMAIL_ENABLED") === "true",
      slack: this.configService.get<string>("ALERTS_SLACK_ENABLED") === "true",
      webhook: this.configService.get<string>("ALERTS_WEBHOOK_ENABLED") === "true",
    };

    const notifications: Promise<void>[] = [];

    // Email уведомления (только для critical)
    if (alertConfig.email && rule.severity === "critical") {
      const emailTo = this.configService.get<string>("ALERTS_EMAIL_TO");
      if (emailTo) {
        notifications.push(this.sendEmailAlert(rule, message, emailTo));
      }
    }

    // Slack уведомления
    if (alertConfig.slack) {
      const slackWebhook = this.configService.get<string>("ALERTS_SLACK_WEBHOOK");
      if (slackWebhook) {
        notifications.push(this.sendSlackAlert(rule, message, slackWebhook));
      }
    }

    // Webhook уведомления
    if (alertConfig.webhook) {
      const webhookUrl = this.configService.get<string>("ALERTS_WEBHOOK_URL");
      if (webhookUrl) {
        notifications.push(this.sendWebhookAlert(rule, message, webhookUrl));
      }
    }

    await Promise.allSettled(notifications);
  }

  private async sendEmailAlert(rule: AlertRule, message: string, emailTo: string): Promise<void> {
    // TODO: Реализовать отправку email
    // Можно использовать nodemailer или sendgrid
    this.logger.log(`[EMAIL ALERT] Would send to ${emailTo}: ${message}`, "AlertsService");
  }

  private async sendSlackAlert(rule: AlertRule, message: string, webhookUrl: string): Promise<void> {
    try {
      const axios = (await import("axios")).default;
      const color = rule.severity === "critical" ? "danger" : rule.severity === "warning" ? "warning" : "good";
      
      await axios.post(webhookUrl, {
        text: `*MasterProfi Alert*`,
        attachments: [
          {
            color,
            title: `${rule.severity.toUpperCase()}: ${rule.name}`,
            text: message,
            fields: [
              {
                title: "Metric",
                value: rule.metric,
                short: true,
              },
              {
                title: "Threshold",
                value: `${this.getConditionSymbol(rule.condition)} ${rule.threshold}`,
                short: true,
              },
            ],
            ts: Math.floor(Date.now() / 1000),
          },
        ],
      });
    } catch (error) {
      this.logger.error(`Failed to send Slack alert: ${error.message}`, error?.stack, "AlertsService");
    }
  }

  private async sendWebhookAlert(rule: AlertRule, message: string, webhookUrl: string): Promise<void> {
    try {
      const axios = (await import("axios")).default;
      await axios.post(webhookUrl, {
        service: "masterprofi-backend",
        alert: {
          name: rule.name,
          severity: rule.severity,
          message,
          metric: rule.metric,
          threshold: rule.threshold,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      this.logger.error(`Failed to send webhook alert: ${error.message}`, error?.stack, "AlertsService");
    }
  }

  /**
   * Получить историю алертов
   */
  getAlertHistory(limit: number = 50): Array<typeof this.alertHistory[0]> {
    return this.alertHistory.slice(-limit);
  }

  /**
   * Получить все правила алертов
   */
  getAlertRules(): AlertRule[] {
    return [...this.alertRules];
  }

  /**
   * Добавить новое правило алерта
   */
  addAlertRule(rule: AlertRule): void {
    this.alertRules.push(rule);
    this.logger.log(`Alert rule added: ${rule.name}`, "AlertsService");
  }

  /**
   * Обновить правило алерта
   */
  updateAlertRule(name: string, updates: Partial<AlertRule>): boolean {
    const rule = this.alertRules.find((r) => r.name === name);
    if (rule) {
      Object.assign(rule, updates);
      this.logger.log(`Alert rule updated: ${name}`, "AlertsService");
      return true;
    }
    return false;
  }

  /**
   * Включить/выключить правило
   */
  toggleAlertRule(name: string, enabled: boolean): boolean {
    return this.updateAlertRule(name, { enabled });
  }
}

