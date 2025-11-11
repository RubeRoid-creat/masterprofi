import { DataSource } from "typeorm";

export async function checkDatabaseConnection(dataSource: DataSource): Promise<boolean> {
  try {
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }
    await dataSource.query("SELECT 1");
    console.log("✅ Database connection successful");
    return true;
  } catch (error: any) {
    console.error("❌ Database connection failed:", error.message);
    return false;
  }
}

export async function checkTablesExist(dataSource: DataSource): Promise<boolean> {
  try {
    const requiredTables = [
      "users",
      "orders",
      "payments",
      "reviews",
      "master_profiles",
    ];

    const existingTables = await dataSource.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    const tableNames = existingTables.map((t: any) => t.table_name);

    const missingTables = requiredTables.filter(
      (table) => !tableNames.includes(table)
    );

    if (missingTables.length > 0) {
      console.error(
        `❌ Missing tables: ${missingTables.join(", ")}`
      );
      console.log(
        "💡 Run migrations: npm run migration:run"
      );
      return false;
    }

    console.log("✅ All required tables exist");
    return true;
  } catch (error: any) {
    console.error("❌ Error checking tables:", error.message);
    return false;
  }
}





