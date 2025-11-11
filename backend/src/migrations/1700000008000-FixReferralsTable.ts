import { MigrationInterface, QueryRunner } from "typeorm";

export class FixReferralsTable1700000008000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Проверяем существует ли таблица referral (старое имя)
    const referralTableExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'referral'
      );
    `);

    // Проверяем существует ли таблица referrals (новое имя)
    const referralsTableExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'referrals'
      );
    `);

    if (referralTableExists[0].exists && !referralsTableExists[0].exists) {
      // Переименовываем таблицу referral в referrals
      await queryRunner.query(`ALTER TABLE "referral" RENAME TO "referrals";`);
    }

    // Создаем таблицу referrals если её нет
    if (!referralsTableExists[0].exists && !referralTableExists[0].exists) {
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "referrals" (
          "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
          "referrerId" uuid NOT NULL,
          "referredId" uuid NOT NULL,
          "totalEarned" numeric(10,2) NOT NULL DEFAULT 0,
          "ordersCount" integer NOT NULL DEFAULT 0,
          "isActive" boolean NOT NULL DEFAULT true,
          "createdAt" timestamp NOT NULL DEFAULT now(),
          "updatedAt" timestamp NOT NULL DEFAULT now(),
          CONSTRAINT "FK_referrals_referrer" FOREIGN KEY ("referrerId") REFERENCES "users"("id") ON DELETE CASCADE,
          CONSTRAINT "FK_referrals_referred" FOREIGN KEY ("referredId") REFERENCES "users"("id") ON DELETE CASCADE,
          CONSTRAINT "UQ_referrals_pair" UNIQUE ("referrerId", "referredId")
        );
      `);
    } else {
      // Добавляем недостающие поля если таблица уже существует
      const columns = await queryRunner.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'referrals';
      `);

      const columnNames = columns.map((col: any) => col.column_name);

      if (!columnNames.includes("totalEarned")) {
        await queryRunner.query(`
          ALTER TABLE "referrals" 
          ADD COLUMN "totalEarned" numeric(10,2) NOT NULL DEFAULT 0;
        `);
      }

      if (!columnNames.includes("ordersCount")) {
        await queryRunner.query(`
          ALTER TABLE "referrals" 
          ADD COLUMN "ordersCount" integer NOT NULL DEFAULT 0;
        `);
      }

      if (!columnNames.includes("isActive")) {
        await queryRunner.query(`
          ALTER TABLE "referrals" 
          ADD COLUMN "isActive" boolean NOT NULL DEFAULT true;
        `);
      }

      if (!columnNames.includes("updatedAt")) {
        await queryRunner.query(`
          ALTER TABLE "referrals" 
          ADD COLUMN "updatedAt" timestamp NOT NULL DEFAULT now();
        `);
      }
    }

    // Исправляем имена foreign key constraints если нужно
    const constraints = await queryRunner.query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_schema = 'public' 
      AND table_name = 'referrals'
      AND constraint_type = 'FOREIGN KEY';
    `);

    const constraintNames = constraints.map((c: any) => c.constraint_name);

    if (!constraintNames.includes("FK_referrals_referrer")) {
      // Удаляем старые constraints если есть
      if (constraintNames.includes("FK_referral_referrer")) {
        await queryRunner.query(`
          ALTER TABLE "referrals" 
          DROP CONSTRAINT IF EXISTS "FK_referral_referrer";
        `);
      }
      await queryRunner.query(`
        ALTER TABLE "referrals" 
        ADD CONSTRAINT "FK_referrals_referrer" 
        FOREIGN KEY ("referrerId") REFERENCES "users"("id") ON DELETE CASCADE;
      `);
    }

    if (!constraintNames.includes("FK_referrals_referred")) {
      if (constraintNames.includes("FK_referral_referred")) {
        await queryRunner.query(`
          ALTER TABLE "referrals" 
          DROP CONSTRAINT IF EXISTS "FK_referral_referred";
        `);
      }
      await queryRunner.query(`
        ALTER TABLE "referrals" 
        ADD CONSTRAINT "FK_referrals_referred" 
        FOREIGN KEY ("referredId") REFERENCES "users"("id") ON DELETE CASCADE;
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Откат миграции (опционально)
      await queryRunner.query(`DROP TABLE IF EXISTS "referrals";`);
  }
}

