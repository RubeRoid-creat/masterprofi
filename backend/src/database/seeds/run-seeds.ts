import { DataSource } from "typeorm";
import { config } from "dotenv";
import * as path from "path";
import { seedUsers } from "./user.seed";
import { seedMlm } from "./mlm.seed";

config();

async function runSeeds() {
  const dataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME || "masterprofi",
    password: process.env.DB_PASSWORD || "masterprofi_pass",
    database: process.env.DB_NAME || "masterprofi",
    entities: [path.join(__dirname, "../**/*.entity{.ts,.js}")],
    synchronize: false,
    logging: true,
  });

  try {
    await dataSource.initialize();
    console.log("📦 Database connected, running seeds...\n");

    // Запускаем seeds
    await seedUsers(dataSource);
    await seedMlm(dataSource);

    console.log("\n✅ All seeds completed successfully!");
  } catch (error) {
    console.error("❌ Error running seeds:", error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

runSeeds();

