import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from "typeorm";

export class CrmMastersSchema1700000004000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // CRM Masters table
    await queryRunner.createTable(
      new Table({
        name: "crm_masters",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          { name: "userId", type: "uuid" },
          { name: "rank", type: "varchar", length: "50", default: "'junior'" },
          { name: "commissionRate", type: "decimal", precision: 5, scale: 2, default: 0 },
          { name: "isActive", type: "boolean", default: true },
          { name: "isAvailable", type: "boolean", default: false },
          { name: "schedule", type: "jsonb", isNullable: true },
          { name: "serviceArea", type: "jsonb", isNullable: true },
          { name: "latitude", type: "decimal", precision: 10, scale: 7, isNullable: true },
          { name: "longitude", type: "decimal", precision: 10, scale: 7, isNullable: true },
          { name: "averageRating", type: "decimal", precision: 5, scale: 2, default: 0 },
          { name: "totalOrders", type: "int", default: 0 },
          { name: "completedOrders", type: "int", default: 0 },
          { name: "createdAt", type: "timestamp", default: "CURRENT_TIMESTAMP" },
          { name: "updatedAt", type: "timestamp", default: "CURRENT_TIMESTAMP" },
        ],
      }),
      true
    );

    await queryRunner.createIndex(
      "crm_masters",
      new TableIndex({
        name: "IDX_crm_masters_userId",
        columnNames: ["userId"],
      })
    );

    await queryRunner.createIndex(
      "crm_masters",
      new TableIndex({
        name: "IDX_crm_masters_isActive",
        columnNames: ["isActive"],
      })
    );

    await queryRunner.createIndex(
      "crm_masters",
      new TableIndex({
        name: "IDX_crm_masters_isAvailable",
        columnNames: ["isAvailable"],
      })
    );

    // CRM Master Skills table
    await queryRunner.createTable(
      new Table({
        name: "crm_master_skills",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          { name: "masterId", type: "uuid" },
          { name: "skillId", type: "varchar", length: "100" },
          { name: "skillName", type: "varchar", length: "255" },
          { name: "certificationLevel", type: "varchar", length: "50", default: "'basic'" },
          { name: "createdAt", type: "timestamp", default: "CURRENT_TIMESTAMP" },
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      "crm_master_skills",
      new TableForeignKey({
        columnNames: ["masterId"],
        referencedColumnNames: ["id"],
        referencedTableName: "crm_masters",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createIndex(
      "crm_master_skills",
      new TableIndex({
        name: "IDX_crm_master_skills_masterId",
        columnNames: ["masterId"],
      })
    );

    // CRM Master Certificates table
    await queryRunner.createTable(
      new Table({
        name: "crm_master_certificates",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          { name: "masterId", type: "uuid" },
          { name: "name", type: "varchar", length: "255" },
          { name: "issuer", type: "varchar", length: "255" },
          { name: "issueDate", type: "date" },
          { name: "expiryDate", type: "date", isNullable: true },
          { name: "filePath", type: "varchar", length: "500" },
          { name: "isVerified", type: "boolean", default: true },
          { name: "createdAt", type: "timestamp", default: "CURRENT_TIMESTAMP" },
          { name: "updatedAt", type: "timestamp", default: "CURRENT_TIMESTAMP" },
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      "crm_master_certificates",
      new TableForeignKey({
        columnNames: ["masterId"],
        referencedColumnNames: ["id"],
        referencedTableName: "crm_masters",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createIndex(
      "crm_master_certificates",
      new TableIndex({
        name: "IDX_crm_master_certificates_masterId",
        columnNames: ["masterId"],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("crm_master_certificates");
    await queryRunner.dropTable("crm_master_skills");
    await queryRunner.dropTable("crm_masters");
  }
}





