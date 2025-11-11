import { DataSource } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { config } from "dotenv";
import { join, resolve } from "path";

config();

const configService = new ConfigService();

// Используем process.cwd() для получения корневой директории проекта
const rootDir = process.cwd();

// Определяем пути в зависимости от окружения
const isProduction = configService.get("NODE_ENV") === "production";
const entitiesPath = isProduction 
  ? resolve(rootDir, "dist", "**", "*.entity.js")
  : resolve(rootDir, "src", "**", "*.entity{.ts,.js}");
const migrationsPath = isProduction
  ? resolve(rootDir, "dist", "migrations", "*.js")
  : resolve(rootDir, "src", "migrations", "*.{.ts,.js}");

export default new DataSource({
  type: "postgres",
  host: configService.get("DB_HOST") || "localhost",
  port: parseInt(configService.get("DB_PORT") || "5432"),
  username: configService.get("DB_USERNAME") || "masterprofi",
  password: configService.get("DB_PASSWORD") || "masterprofi_pass",
  database: configService.get("DB_NAME") || "masterprofi",
  entities: [entitiesPath],
  migrations: [migrationsPath],
  synchronize: false, // Всегда false для миграций
  logging: configService.get("NODE_ENV") === "development",
  migrationsTableName: "migrations",
});

