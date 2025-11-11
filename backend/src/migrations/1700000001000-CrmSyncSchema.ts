import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class CrmSyncSchema1700000001000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Contacts table
    await queryRunner.createTable(
      new Table({
        name: "crm_contacts",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          { name: "crmId", type: "varchar", isNullable: true },
          { name: "crmType", type: "varchar", isNullable: true },
          { name: "name", type: "varchar" },
          { name: "phone", type: "varchar", isNullable: true },
          { name: "email", type: "varchar", isNullable: true },
          { name: "company", type: "varchar", isNullable: true },
          { name: "position", type: "varchar", isNullable: true },
          { name: "notes", type: "text", isNullable: true },
          { name: "status", type: "varchar", default: "'active'" },
          { name: "syncVersion", type: "int", default: 1 },
          { name: "lastSyncedAt", type: "timestamp", isNullable: true },
          { name: "createdAt", type: "timestamp", default: "CURRENT_TIMESTAMP" },
          { name: "updatedAt", type: "timestamp", default: "CURRENT_TIMESTAMP" },
        ],
      }),
      true
    );

    await queryRunner.createIndex(
      "crm_contacts",
      new TableIndex({
        name: "IDX_crm_contacts_crmId",
        columnNames: ["crmId"],
      })
    );

    await queryRunner.createIndex(
      "crm_contacts",
      new TableIndex({
        name: "IDX_crm_contacts_crmType",
        columnNames: ["crmType"],
      })
    );

    // Deals table
    await queryRunner.createTable(
      new Table({
        name: "crm_deals",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          { name: "crmId", type: "varchar", isNullable: true },
          { name: "crmType", type: "varchar", isNullable: true },
          { name: "title", type: "varchar" },
          { name: "contactId", type: "uuid", isNullable: true },
          { name: "amount", type: "decimal", precision: 10, scale: 2, default: 0 },
          { name: "currency", type: "varchar", isNullable: true },
          { name: "stage", type: "varchar", isNullable: true },
          { name: "description", type: "text", isNullable: true },
          { name: "syncVersion", type: "int", default: 1 },
          { name: "lastSyncedAt", type: "timestamp", isNullable: true },
          { name: "createdAt", type: "timestamp", default: "CURRENT_TIMESTAMP" },
          { name: "updatedAt", type: "timestamp", default: "CURRENT_TIMESTAMP" },
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      "crm_deals",
      new TableForeignKey({
        columnNames: ["contactId"],
        referencedColumnNames: ["id"],
        referencedTableName: "crm_contacts",
        onDelete: "SET NULL",
      })
    );

    // Tasks table
    await queryRunner.createTable(
      new Table({
        name: "crm_tasks",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          { name: "crmId", type: "varchar", isNullable: true },
          { name: "crmType", type: "varchar", isNullable: true },
          { name: "title", type: "varchar" },
          { name: "description", type: "text", isNullable: true },
          { name: "relatedEntityId", type: "uuid", isNullable: true },
          { name: "relatedEntityType", type: "varchar", isNullable: true },
          { name: "dueDate", type: "timestamp", isNullable: true },
          { name: "status", type: "varchar", default: "'pending'" },
          { name: "assignedToUserId", type: "uuid", isNullable: true },
          { name: "syncVersion", type: "int", default: 1 },
          { name: "lastSyncedAt", type: "timestamp", isNullable: true },
          { name: "createdAt", type: "timestamp", default: "CURRENT_TIMESTAMP" },
          { name: "updatedAt", type: "timestamp", default: "CURRENT_TIMESTAMP" },
        ],
      }),
      true
    );

    // Communications table
    await queryRunner.createTable(
      new Table({
        name: "crm_communications",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          { name: "crmId", type: "varchar", isNullable: true },
          { name: "crmType", type: "varchar", isNullable: true },
          { name: "contactId", type: "uuid", isNullable: true },
          { name: "type", type: "varchar" },
          { name: "content", type: "text", isNullable: true },
          { name: "direction", type: "varchar", isNullable: true },
          { name: "duration", type: "int", isNullable: true },
          { name: "syncVersion", type: "int", default: 1 },
          { name: "lastSyncedAt", type: "timestamp", isNullable: true },
          { name: "createdAt", type: "timestamp", default: "CURRENT_TIMESTAMP" },
          { name: "updatedAt", type: "timestamp", default: "CURRENT_TIMESTAMP" },
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      "crm_communications",
      new TableForeignKey({
        columnNames: ["contactId"],
        referencedColumnNames: ["id"],
        referencedTableName: "crm_contacts",
        onDelete: "SET NULL",
      })
    );

    // Products table
    await queryRunner.createTable(
      new Table({
        name: "crm_products",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          { name: "crmId", type: "varchar", isNullable: true },
          { name: "crmType", type: "varchar", isNullable: true },
          { name: "name", type: "varchar" },
          { name: "description", type: "text", isNullable: true },
          { name: "price", type: "decimal", precision: 10, scale: 2 },
          { name: "currency", type: "varchar", isNullable: true },
          { name: "sku", type: "varchar", isNullable: true },
          { name: "category", type: "varchar", isNullable: true },
          { name: "stock", type: "int", default: 0 },
          { name: "syncVersion", type: "int", default: 1 },
          { name: "lastSyncedAt", type: "timestamp", isNullable: true },
          { name: "createdAt", type: "timestamp", default: "CURRENT_TIMESTAMP" },
          { name: "updatedAt", type: "timestamp", default: "CURRENT_TIMESTAMP" },
        ],
      }),
      true
    );

    // Sync Queue table
    await queryRunner.createTable(
      new Table({
        name: "crm_sync_queue",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          { name: "entityType", type: "varchar" },
          { name: "entityId", type: "uuid", isNullable: true },
          {
            name: "operation",
            type: "enum",
            enum: ["CREATE", "UPDATE", "DELETE"],
          },
          { name: "payload", type: "jsonb" },
          {
            name: "status",
            type: "enum",
            enum: ["PENDING", "SENT", "ERROR", "PROCESSING"],
            default: "'PENDING'",
          },
          { name: "retryCount", type: "int", default: 0 },
          { name: "errorMessage", type: "text", isNullable: true },
          { name: "userId", type: "uuid", isNullable: true },
          { name: "createdAt", type: "timestamp", default: "CURRENT_TIMESTAMP" },
          { name: "updatedAt", type: "timestamp", default: "CURRENT_TIMESTAMP" },
          { name: "processedAt", type: "timestamp", isNullable: true },
        ],
      }),
      true
    );

    await queryRunner.createIndex(
      "crm_sync_queue",
      new TableIndex({
        name: "IDX_sync_queue_status",
        columnNames: ["status"],
      })
    );

    await queryRunner.createIndex(
      "crm_sync_queue",
      new TableIndex({
        name: "IDX_sync_queue_userId",
        columnNames: ["userId"],
      })
    );

    // Sync Status table
    await queryRunner.createTable(
      new Table({
        name: "crm_sync_status",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          { name: "userId", type: "uuid" },
          { name: "crmType", type: "varchar", isNullable: true },
          { name: "lastSyncAt", type: "timestamp", isNullable: true },
          { name: "lastFullSyncAt", type: "timestamp", isNullable: true },
          { name: "isSyncing", type: "boolean", default: false },
          { name: "totalContacts", type: "int", default: 0 },
          { name: "totalDeals", type: "int", default: 0 },
          { name: "totalTasks", type: "int", default: 0 },
          { name: "pendingChanges", type: "int", default: 0 },
          { name: "lastError", type: "text", isNullable: true },
          { name: "createdAt", type: "timestamp", default: "CURRENT_TIMESTAMP" },
          { name: "updatedAt", type: "timestamp", default: "CURRENT_TIMESTAMP" },
        ],
      }),
      true
    );

    await queryRunner.createIndex(
      "crm_sync_status",
      new TableIndex({
        name: "IDX_sync_status_userId",
        columnNames: ["userId"],
        isUnique: true,
      })
    );

    // CRM Connections table
    await queryRunner.createTable(
      new Table({
        name: "crm_connections",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          { name: "userId", type: "uuid" },
          {
            name: "crmType",
            type: "enum",
            enum: ["amocrm", "bitrix24"],
          },
          { name: "apiUrl", type: "varchar", isNullable: true },
          { name: "accessToken", type: "text", isNullable: true },
          { name: "refreshToken", type: "text", isNullable: true },
          { name: "tokenExpiresAt", type: "timestamp", isNullable: true },
          { name: "clientId", type: "varchar", isNullable: true },
          { name: "clientSecret", type: "text", isNullable: true },
          { name: "isActive", type: "boolean", default: true },
          { name: "settings", type: "jsonb", isNullable: true },
          { name: "lastSyncAt", type: "timestamp", isNullable: true },
          { name: "lastError", type: "text", isNullable: true },
          { name: "createdAt", type: "timestamp", default: "CURRENT_TIMESTAMP" },
          { name: "updatedAt", type: "timestamp", default: "CURRENT_TIMESTAMP" },
        ],
      }),
      true
    );

    await queryRunner.createIndex(
      "crm_connections",
      new TableIndex({
        name: "IDX_crm_connections_userId",
        columnNames: ["userId"],
      })
    );

    await queryRunner.createIndex(
      "crm_connections",
      new TableIndex({
        name: "IDX_crm_connections_crmType",
        columnNames: ["crmType"],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("crm_connections");
    await queryRunner.dropTable("crm_sync_status");
    await queryRunner.dropTable("crm_sync_queue");
    await queryRunner.dropTable("crm_products");
    await queryRunner.dropTable("crm_communications");
    await queryRunner.dropTable("crm_tasks");
    await queryRunner.dropTable("crm_deals");
    await queryRunner.dropTable("crm_contacts");
  }
}

