import { MigrationInterface, QueryRunner, Table, TableIndex, TableColumn } from "typeorm";

export class SyncChangesTable1700000006000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Создаем таблицу sync_changes
    await queryRunner.createTable(
      new Table({
        name: "sync_changes",
        columns: [
          {
            name: "id",
            type: "serial",
            isPrimary: true,
          },
          {
            name: "entity_type",
            type: "varchar",
            length: "50",
          },
          {
            name: "entity_id",
            type: "uuid",
          },
          {
            name: "operation",
            type: "enum",
            enum: ["INSERT", "UPDATE", "DELETE"],
          },
          {
            name: "change_timestamp",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "processed",
            type: "boolean",
            default: false,
          },
          {
            name: "createdAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
        ],
      }),
      true
    );

    // Создаем индексы
    await queryRunner.createIndex(
      "sync_changes",
      new TableIndex({
        name: "IDX_sync_changes_entity_type",
        columnNames: ["entity_type"],
      })
    );

    await queryRunner.createIndex(
      "sync_changes",
      new TableIndex({
        name: "IDX_sync_changes_entity_id",
        columnNames: ["entity_id"],
      })
    );

    await queryRunner.createIndex(
      "sync_changes",
      new TableIndex({
        name: "IDX_sync_changes_operation",
        columnNames: ["operation"],
      })
    );

    await queryRunner.createIndex(
      "sync_changes",
      new TableIndex({
        name: "IDX_sync_changes_change_timestamp",
        columnNames: ["change_timestamp"],
      })
    );

    await queryRunner.createIndex(
      "sync_changes",
      new TableIndex({
        name: "IDX_sync_changes_processed",
        columnNames: ["processed"],
      })
    );

    // Добавляем поля version и lastModified в таблицу crm_contacts, если их нет
    const contactsTable = await queryRunner.getTable("crm_contacts");
    if (contactsTable) {
      const hasVersion = contactsTable.findColumnByName("version");
      const hasLastModified = contactsTable.findColumnByName("last_modified");

      if (!hasVersion) {
        await queryRunner.addColumn(
          "crm_contacts",
          new TableColumn({
            name: "version",
            type: "int",
            default: 1,
          })
        );
        await queryRunner.createIndex(
          "crm_contacts",
          new TableIndex({
            name: "IDX_crm_contacts_version",
            columnNames: ["version"],
          })
        );
      }

      if (!hasLastModified) {
        await queryRunner.addColumn(
          "crm_contacts",
          new TableColumn({
            name: "last_modified",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          })
        );
        await queryRunner.createIndex(
          "crm_contacts",
          new TableIndex({
            name: "IDX_crm_contacts_last_modified",
            columnNames: ["last_modified"],
          })
        );
      }
    }

    // Добавляем поля version и lastModified в таблицу crm_deals, если их нет
    const dealsTable = await queryRunner.getTable("crm_deals");
    if (dealsTable) {
      const hasVersion = dealsTable.findColumnByName("version");
      const hasLastModified = dealsTable.findColumnByName("last_modified");

      if (!hasVersion) {
        await queryRunner.addColumn(
          "crm_deals",
          new TableColumn({
            name: "version",
            type: "int",
            default: 1,
          })
        );
        await queryRunner.createIndex(
          "crm_deals",
          new TableIndex({
            name: "IDX_crm_deals_version",
            columnNames: ["version"],
          })
        );
      }

      if (!hasLastModified) {
        await queryRunner.addColumn(
          "crm_deals",
          new TableColumn({
            name: "last_modified",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          })
        );
        await queryRunner.createIndex(
          "crm_deals",
          new TableIndex({
            name: "IDX_crm_deals_last_modified",
            columnNames: ["last_modified"],
          })
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удаляем индексы и колонки
    const contactsTable = await queryRunner.getTable("crm_contacts");
    if (contactsTable) {
      const hasVersion = contactsTable.findColumnByName("version");
      const hasLastModified = contactsTable.findColumnByName("last_modified");

      if (hasVersion) {
        await queryRunner.dropIndex("crm_contacts", "IDX_crm_contacts_version");
        await queryRunner.dropColumn("crm_contacts", "version");
      }

      if (hasLastModified) {
        await queryRunner.dropIndex("crm_contacts", "IDX_crm_contacts_last_modified");
        await queryRunner.dropColumn("crm_contacts", "last_modified");
      }
    }

    const dealsTable = await queryRunner.getTable("crm_deals");
    if (dealsTable) {
      const hasVersion = dealsTable.findColumnByName("version");
      const hasLastModified = dealsTable.findColumnByName("last_modified");

      if (hasVersion) {
        await queryRunner.dropIndex("crm_deals", "IDX_crm_deals_version");
        await queryRunner.dropColumn("crm_deals", "version");
      }

      if (hasLastModified) {
        await queryRunner.dropIndex("crm_deals", "IDX_crm_deals_last_modified");
        await queryRunner.dropColumn("crm_deals", "last_modified");
      }
    }

    // Удаляем таблицу sync_changes
    await queryRunner.dropTable("sync_changes");
  }
}

