import { Injectable } from "@nestjs/common";
import * as client from "prom-client";

@Injectable()
export class MetricsService {
  private register: client.Registry;
  
  // HTTP метрики
  public httpRequestDuration: client.Histogram<string>;
  public httpRequestTotal: client.Counter<string>;
  public httpRequestInProgress: client.Gauge<string>;
  
  // Database метрики
  public dbQueryDuration: client.Histogram<string>;
  public dbQueryTotal: client.Counter<string>;
  public dbConnectionsActive: client.Gauge<string>;
  
  // Бизнес метрики
  public ordersCreated: client.Counter<string>;
  public ordersCompleted: client.Counter<string>;
  public paymentsProcessed: client.Counter<string>;
  public paymentsAmount: client.Counter<string>;
  public usersRegistered: client.Counter<string>;
  public authAttempts: client.Counter<string>;
  public authFailures: client.Counter<string>;
  
  // Системные метрики
  public cacheHits: client.Counter<string>;
  public cacheMisses: client.Counter<string>;
  public websocketConnections: client.Gauge<string>;
  public websocketMessages: client.Counter<string>;
  
  // Метрики ошибок
  public errorsTotal: client.Counter<string>;
  public errorsByType: client.Counter<string>;

  constructor() {
    this.register = new client.Registry();
    
    // Добавляем стандартные метрики Node.js
    client.collectDefaultMetrics({
      register: this.register,
      prefix: "masterprofi_",
    });

    this.initializeHttpMetrics();
    this.initializeDatabaseMetrics();
    this.initializeBusinessMetrics();
    this.initializeSystemMetrics();
    this.initializeErrorMetrics();
  }

  private initializeHttpMetrics() {
    this.httpRequestDuration = new client.Histogram({
      name: "masterprofi_http_request_duration_seconds",
      help: "Duration of HTTP requests in seconds",
      labelNames: ["method", "route", "status_code"],
      buckets: [0.1, 0.5, 1, 2, 5, 10],
      registers: [this.register],
    });

    this.httpRequestTotal = new client.Counter({
      name: "masterprofi_http_requests_total",
      help: "Total number of HTTP requests",
      labelNames: ["method", "route", "status_code"],
      registers: [this.register],
    });

    this.httpRequestInProgress = new client.Gauge({
      name: "masterprofi_http_requests_in_progress",
      help: "Number of HTTP requests currently in progress",
      registers: [this.register],
    });
  }

  private initializeDatabaseMetrics() {
    this.dbQueryDuration = new client.Histogram({
      name: "masterprofi_db_query_duration_seconds",
      help: "Duration of database queries in seconds",
      labelNames: ["operation", "table"],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
      registers: [this.register],
    });

    this.dbQueryTotal = new client.Counter({
      name: "masterprofi_db_queries_total",
      help: "Total number of database queries",
      labelNames: ["operation", "table", "status"],
      registers: [this.register],
    });

    this.dbConnectionsActive = new client.Gauge({
      name: "masterprofi_db_connections_active",
      help: "Number of active database connections",
      registers: [this.register],
    });
  }

  private initializeBusinessMetrics() {
    this.ordersCreated = new client.Counter({
      name: "masterprofi_orders_created_total",
      help: "Total number of orders created",
      labelNames: ["status"],
      registers: [this.register],
    });

    this.ordersCompleted = new client.Counter({
      name: "masterprofi_orders_completed_total",
      help: "Total number of orders completed",
      registers: [this.register],
    });

    this.paymentsProcessed = new client.Counter({
      name: "masterprofi_payments_processed_total",
      help: "Total number of payments processed",
      labelNames: ["status", "provider"],
      registers: [this.register],
    });

    this.paymentsAmount = new client.Counter({
      name: "masterprofi_payments_amount_total",
      help: "Total amount of payments in rubles",
      labelNames: ["status"],
      registers: [this.register],
    });

    this.usersRegistered = new client.Counter({
      name: "masterprofi_users_registered_total",
      help: "Total number of users registered",
      labelNames: ["role"],
      registers: [this.register],
    });

    this.authAttempts = new client.Counter({
      name: "masterprofi_auth_attempts_total",
      help: "Total number of authentication attempts",
      labelNames: ["method"],
      registers: [this.register],
    });

    this.authFailures = new client.Counter({
      name: "masterprofi_auth_failures_total",
      help: "Total number of failed authentication attempts",
      labelNames: ["reason"],
      registers: [this.register],
    });
  }

  private initializeSystemMetrics() {
    this.cacheHits = new client.Counter({
      name: "masterprofi_cache_hits_total",
      help: "Total number of cache hits",
      labelNames: ["cache_key"],
      registers: [this.register],
    });

    this.cacheMisses = new client.Counter({
      name: "masterprofi_cache_misses_total",
      help: "Total number of cache misses",
      labelNames: ["cache_key"],
      registers: [this.register],
    });

    this.websocketConnections = new client.Gauge({
      name: "masterprofi_websocket_connections",
      help: "Number of active WebSocket connections",
      registers: [this.register],
    });

    this.websocketMessages = new client.Counter({
      name: "masterprofi_websocket_messages_total",
      help: "Total number of WebSocket messages sent",
      labelNames: ["event_type"],
      registers: [this.register],
    });
  }

  private initializeErrorMetrics() {
    this.errorsTotal = new client.Counter({
      name: "masterprofi_errors_total",
      help: "Total number of errors",
      labelNames: ["error_type", "context"],
      registers: [this.register],
    });

    this.errorsByType = new client.Counter({
      name: "masterprofi_errors_by_type_total",
      help: "Total number of errors by type",
      labelNames: ["error_class"],
      registers: [this.register],
    });
  }

  /**
   * Получить метрики в формате Prometheus
   */
  async getMetrics(): Promise<string> {
    return this.register.metrics();
  }

  /**
   * Регистр метрик (для использования в других сервисах)
   */
  getRegister(): client.Registry {
    return this.register;
  }

  /**
   * Удалить все метрики (для тестов)
   */
  async clearMetrics(): Promise<void> {
    await this.register.clear();
  }
}

