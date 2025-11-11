import { DataSource } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { config } from "dotenv";

config();

const configService = new ConfigService();

export default new DataSource({
  type: "postgres",
  host: configService.get("DB_HOST") || "localhost",
  port: parseInt(configService.get("DB_PORT") || "5432"),
  username: configService.get("DB_USERNAME") || "masterprofi",
  password: configService.get("DB_PASSWORD") || "masterprofi_pass",
  database: configService.get("DB_NAME") || "masterprofi",
  entities: [__dirname + "/src/**/*.entity{.ts,.js}"],
  migrations: [__dirname + "/src/migrations/*{.ts,.js}"],
  synchronize: false, // Всегда false для миграций
  logging: configService.get("NODE_ENV") === "development",
  migrationsTableName: "migrations",
});

