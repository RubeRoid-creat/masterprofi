import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ThrottlerModule } from "@nestjs/throttler";
import { ThrottlerBehindProxyGuard } from "./common/guards/throttler-behind-proxy.guard";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { OrdersModule } from "./orders/orders.module";
import { PaymentsModule } from "./payments/payments.module";
import { YooKassaModule } from "./payments/yookassa/yookassa.module";
import { MlmModule } from "./mlm/mlm.module";
import { NotificationModule } from "./notification/notification.module";
import { AuditModule } from "./audit/audit.module";
import { ReportsModule } from "./reports/reports.module";
import { ChatModule } from "./chat/chat.module";
import { GeolocationModule } from "./geolocation/geolocation.module";
import { ReviewsModule } from "./reviews/reviews.module";
import { ScheduleModule } from "./schedule/schedule.module";
import { CacheModule } from "./cache/cache.module";
import { StatsModule } from "./stats/stats.module";
import { LoggerModule } from "./logger/logger.module";
import { MetricsModule } from "./metrics/metrics.module";
import { AlertsModule } from "./alerts/alerts.module";
import { CrmModule } from "./crm/crm.module";
import { CrmCustomersModule } from "./crm-customers/crm-customers.module";
import { CrmOrdersModule } from "./crm-orders/crm-orders.module";
import { CrmMastersModule } from "./crm-masters/crm-masters.module";
import { CrmFinanceModule } from "./crm-finance/crm-finance.module";
import { SecurityModule } from "./security/security.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "5432"),
      username: process.env.DB_USERNAME || "masterprofi",
      password: process.env.DB_PASSWORD || "MasterProfi2024!Secure",
      database: process.env.DB_NAME || "masterprofi",
      autoLoadEntities: true,
      synchronize: false, // Отключено - используем миграции
      migrations: ["dist/migrations/*.js"],
      migrationsRun: false, // Миграции запускаются вручную
      logging: process.env.NODE_ENV === "development",
    }),
    // Rate Limiting - отключаем для development, оставляем только для auth в production
    ThrottlerModule.forRoot(
      process.env.NODE_ENV === "production"
        ? [
            {
              name: "default",
              ttl: 60000, // 1 minute
              limit: 1000, // 1000 requests per minute
            },
            {
              name: "auth",
              ttl: 60000, // 1 minute
              limit: 10, // 10 login attempts per minute
            },
          ]
        : [
            {
              name: "default",
              ttl: 60000, // 1 minute
              limit: 100000, // Очень высокий лимит для dev
            },
            {
              name: "auth",
              ttl: 60000, // 1 minute
              limit: 20, // 20 login attempts per minute в dev
            },
          ]
    ),
    AuthModule,
    UsersModule,
    OrdersModule,
    PaymentsModule,
    YooKassaModule,
        MlmModule,
        NotificationModule,
        AuditModule,
        ReportsModule,
        ChatModule,
        GeolocationModule,
    ReviewsModule,
            ScheduleModule,
            CacheModule,
            StatsModule,
            LoggerModule,
            MetricsModule,
            AlertsModule,
            CrmModule,
            CrmCustomersModule,
            CrmOrdersModule,
            CrmMastersModule,
            CrmFinanceModule,
            SecurityModule,
      ],
  controllers: [AppController],
  providers: [
    AppService,
    // Rate limiting только в production
    ...(process.env.NODE_ENV === "production"
      ? [
          {
            provide: APP_GUARD,
            useClass: ThrottlerBehindProxyGuard,
          },
        ]
      : []),
  ],
})
export class AppModule {}
