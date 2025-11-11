import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class DeviceTable1700000007000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Создаем таблицу devices
    await queryRunner.createTable(
      new Table({
        name: "devices",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            default: "uuid_generate_v4()",
          },
          {
            name: "userId",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "deviceId",
            type: "varchar",
            isUnique: true,
            isNullable: false,
          },
          {
            name: "deviceName",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "platform",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "appVersion",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "osVersion",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "fcmToken",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "isActive",
            type: "boolean",
            default: true,
          },
          {
            name: "lastActiveAt",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "metadata",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "createdAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updatedAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            onUpdate: "CURRENT_TIMESTAMP",
          },
        ],
      }),
      true
    );

    // Создаем индексы
    await queryRunner.createIndex(
      "devices",
      new TableIndex({
        name: "IDX_DEVICES_USER_ID",
        columnNames: ["userId"],
      })
    );

    await queryRunner.createIndex(
      "devices",
      new TableIndex({
        name: "IDX_DEVICES_DEVICE_ID",
        columnNames: ["deviceId"],
      })
    );

    // Создаем внешний ключ
    await queryRunner.createForeignKey(
      "devices",
      new TableForeignKey({
        columnNames: ["userId"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "CASCADE",
      })
    );

    // Добавляем поля syncToken и deviceId в crm_sync_status
    await queryRunner.query(`
      ALTER TABLE "crm_sync_status"
      ADD COLUMN IF NOT EXISTS "syncToken" VARCHAR(255) NULL,
      ADD COLUMN IF NOT EXISTS "deviceId" VARCHAR(255) NULL;
    `);

    // Создаем индекс для syncToken
    await queryRunner.createIndex(
      "crm_sync_status",
      new TableIndex({
        name: "IDX_SYNC_STATUS_TOKEN",
        columnNames: ["syncToken"],
        isUnique: true,
        where: '"syncToken" IS NOT NULL',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удаляем индекс для syncToken
    await queryRunner.dropIndex("crm_sync_status", "IDX_SYNC_STATUS_TOKEN");

    // Удаляем поля из crm_sync_status
    await queryRunner.query(`
      ALTER TABLE "crm_sync_status"
      DROP COLUMN IF EXISTS "syncToken",
      DROP COLUMN IF EXISTS "deviceId";
    `);

    // Удаляем таблицу devices
    await queryRunner.dropTable("devices");
  }
}

