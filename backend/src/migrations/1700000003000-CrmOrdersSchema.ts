import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from "typeorm";

export class CrmOrdersSchema1700000003000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // CRM Order Status History table
    await queryRunner.createTable(
      new Table({
        name: "crm_order_status_history",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          { name: "orderId", type: "uuid" },
          { name: "status", type: "varchar", length: "50" },
          { name: "changedBy", type: "uuid" },
          { name: "comment", type: "text", isNullable: true },
          { name: "timestamp", type: "timestamp", default: "CURRENT_TIMESTAMP" },
        ],
      }),
      true
    );

    await queryRunner.createIndex(
      "crm_order_status_history",
      new TableIndex({
        name: "IDX_crm_order_status_history_orderId",
        columnNames: ["orderId"],
      })
    );

    await queryRunner.createIndex(
      "crm_order_status_history",
      new TableIndex({
        name: "IDX_crm_order_status_history_timestamp",
        columnNames: ["timestamp"],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("crm_order_status_history");
  }
}





