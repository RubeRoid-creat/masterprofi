import { MigrationInterface, QueryRunner } from "typeorm";

export class FixBonusesTable1700000008001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Проверяем существует ли таблица bonus (старое имя)
    const bonusTableExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'bonus'
      );
    `);

    // Проверяем существует ли таблица bonuses (новое имя)
    const bonusesTableExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'bonuses'
      );
    `);

    if (bonusTableExists[0].exists && !bonusesTableExists[0].exists) {
      // Переименовываем таблицу bonus в bonuses
      await queryRunner.query(`ALTER TABLE "bonus" RENAME TO "bonuses";`);
    }

    // Добавляем недостающие поля если таблица существует
    if (bonusesTableExists[0].exists || bonusTableExists[0].exists) {
      const tableName = bonusesTableExists[0].exists ? "bonuses" : "bonus";
      const columns = await queryRunner.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = '${tableName}';
      `);

      const columnNames = columns.map((col: any) => col.column_name);

      if (!columnNames.includes("referralId")) {
        await queryRunner.query(`
          ALTER TABLE "${tableName}" 
          ADD COLUMN "referralId" varchar;
        `);
      }

      if (!columnNames.includes("commissionRate")) {
        await queryRunner.query(`
          ALTER TABLE "${tableName}" 
          ADD COLUMN "commissionRate" numeric(5,2);
        `);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "bonuses";`);
  }
}

