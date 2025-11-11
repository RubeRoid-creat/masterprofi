import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CrmFinanceSchema1700000005000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // CRM Transactions table
    await queryRunner.createTable(
      new Table({
        name: "crm_transactions",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          { name: "type", type: "varchar", length: "50" },
          { name: "amount", type: "decimal", precision: 10, scale: 2 },
          { name: "currency", type: "varchar", length: "10", default: "'RUB'" },
          { name: "status", type: "varchar", length: "50", default: "'pending'" },
          { name: "orderId", type: "uuid", isNullable: true },
          { name: "masterId", type: "uuid", isNullable: true },
          { name: "description", type: "text", isNullable: true },
          { name: "metadata", type: "jsonb", isNullable: true },
          { name: "createdAt", type: "timestamp", default: "CURRENT_TIMESTAMP" },
          { name: "updatedAt", type: "timestamp", default: "CURRENT_TIMESTAMP" },
        ],
      }),
      true
    );

    await queryRunner.createIndex(
      "crm_transactions",
      new TableIndex({
        name: "IDX_crm_transactions_type",
        columnNames: ["type"],
      })
    );

    await queryRunner.createIndex(
      "crm_transactions",
      new TableIndex({
        name: "IDX_crm_transactions_status",
        columnNames: ["status"],
      })
    );

    await queryRunner.createIndex(
      "crm_transactions",
      new TableIndex({
        name: "IDX_crm_transactions_orderId",
        columnNames: ["orderId"],
      })
    );

    await queryRunner.createIndex(
      "crm_transactions",
      new TableIndex({
        name: "IDX_crm_transactions_masterId",
        columnNames: ["masterId"],
      })
    );

    await queryRunner.createIndex(
      "crm_transactions",
      new TableIndex({
        name: "IDX_crm_transactions_createdAt",
        columnNames: ["createdAt"],
      })
    );

    // CRM Payout Requests table
    await queryRunner.createTable(
      new Table({
        name: "crm_payout_requests",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          { name: "masterId", type: "uuid" },
          { name: "amount", type: "decimal", precision: 10, scale: 2 },
          { name: "status", type: "varchar", length: "50", default: "'pending'" },
          { name: "requestedBy", type: "uuid" },
          { name: "approvedBy", type: "uuid", isNullable: true },
          { name: "processedAt", type: "timestamp", isNullable: true },
          { name: "comment", type: "text", isNullable: true },
          { name: "createdAt", type: "timestamp", default: "CURRENT_TIMESTAMP" },
          { name: "updatedAt", type: "timestamp", default: "CURRENT_TIMESTAMP" },
        ],
      }),
      true
    );

    await queryRunner.createIndex(
      "crm_payout_requests",
      new TableIndex({
        name: "IDX_crm_payout_requests_masterId",
        columnNames: ["masterId"],
      })
    );

    await queryRunner.createIndex(
      "crm_payout_requests",
      new TableIndex({
        name: "IDX_crm_payout_requests_status",
        columnNames: ["status"],
      })
    );

    // CRM Invoices table
    await queryRunner.createTable(
      new Table({
        name: "crm_invoices",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          { name: "orderId", type: "uuid" },
          { name: "number", type: "varchar", length: "100", isUnique: true },
          { name: "amount", type: "decimal", precision: 10, scale: 2 },
          { name: "dueDate", type: "date" },
          { name: "status", type: "varchar", length: "50", default: "'draft'" },
          { name: "filePath", type: "varchar", length: "500", isNullable: true },
          { name: "createdAt", type: "timestamp", default: "CURRENT_TIMESTAMP" },
          { name: "updatedAt", type: "timestamp", default: "CURRENT_TIMESTAMP" },
        ],
      }),
      true
    );

    await queryRunner.createIndex(
      "crm_invoices",
      new TableIndex({
        name: "IDX_crm_invoices_orderId",
        columnNames: ["orderId"],
      })
    );

    await queryRunner.createIndex(
      "crm_invoices",
      new TableIndex({
        name: "IDX_crm_invoices_number",
        columnNames: ["number"],
      })
    );

    await queryRunner.createIndex(
      "crm_invoices",
      new TableIndex({
        name: "IDX_crm_invoices_status",
        columnNames: ["status"],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("crm_invoices");
    await queryRunner.dropTable("crm_payout_requests");
    await queryRunner.dropTable("crm_transactions");
  }
}





