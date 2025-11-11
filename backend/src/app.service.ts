import { Injectable } from "@nestjs/common";
import { InjectConnection } from "@nestjs/typeorm";
import { Connection } from "typeorm";

@Injectable()
export class AppService {
  constructor(
    @InjectConnection()
    private readonly connection: Connection
  ) {}

  async getHealth() {
    let dbStatus = "unknown";
    let dbError = null;

    try {
      // Проверяем подключение к базе данных
      await this.connection.query("SELECT 1");
      dbStatus = "connected";
    } catch (error: any) {
      dbStatus = "disconnected";
      dbError = error.message || "Database connection failed";
    }

    return {
      status: dbStatus === "connected" ? "OK" : "ERROR",
      service: "MasterProfi Backend",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      database: {
        status: dbStatus,
        ...(dbError && { error: dbError }),
        host: process.env.DB_HOST || "localhost",
        port: process.env.DB_PORT || "5432",
        database: process.env.DB_NAME || "masterprofi",
      },
    };
  }
}
