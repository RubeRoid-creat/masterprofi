import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from "typeorm";

export class CrmCustomersSchema1700000002000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // CRM Customers table
    await queryRunner.createTable(
      new Table({
        name: "crm_customers",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          { name: "userId", type: "uuid" },
          { name: "firstName", type: "varchar", length: "255" },
          { name: "lastName", type: "varchar", length: "255" },
          { name: "email", type: "varchar", length: "255", isNullable: true },
          { name: "phone", type: "varchar", length: "50", isNullable: true },
          { name: "companyName", type: "varchar", length: "255", isNullable: true },
          { name: "taxId", type: "varchar", length: "50", isNullable: true },
          { name: "metadata", type: "jsonb", isNullable: true },
          { name: "lifetimeValue", type: "decimal", precision: 10, scale: 2, default: 0 },
          { name: "status", type: "varchar", length: "50", default: "'active'" },
          { name: "createdAt", type: "timestamp", default: "CURRENT_TIMESTAMP" },
          { name: "updatedAt", type: "timestamp", default: "CURRENT_TIMESTAMP" },
          { name: "deletedAt", type: "timestamp", isNullable: true },
        ],
      }),
      true
    );

    await queryRunner.createIndex(
      "crm_customers",
      new TableIndex({
        name: "IDX_crm_customers_userId",
        columnNames: ["userId"],
      })
    );

    await queryRunner.createIndex(
      "crm_customers",
      new TableIndex({
        name: "IDX_crm_customers_email",
        columnNames: ["email"],
      })
    );

    await queryRunner.createIndex(
      "crm_customers",
      new TableIndex({
        name: "IDX_crm_customers_phone",
        columnNames: ["phone"],
      })
    );

    // CRM Customer Contacts table
    await queryRunner.createTable(
      new Table({
        name: "crm_customer_contacts",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          { name: "customerId", type: "uuid" },
          { name: "type", type: "varchar", length: "50" },
          { name: "value", type: "varchar", length: "255" },
          { name: "isPrimary", type: "boolean", default: false },
          { name: "createdAt", type: "timestamp", default: "CURRENT_TIMESTAMP" },
          { name: "updatedAt", type: "timestamp", default: "CURRENT_TIMESTAMP" },
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      "crm_customer_contacts",
      new TableForeignKey({
        columnNames: ["customerId"],
        referencedColumnNames: ["id"],
        referencedTableName: "crm_customers",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createIndex(
      "crm_customer_contacts",
      new TableIndex({
        name: "IDX_crm_customer_contacts_customerId",
        columnNames: ["customerId"],
      })
    );

    // CRM Customer Addresses table
    await queryRunner.createTable(
      new Table({
        name: "crm_customer_addresses",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          { name: "customerId", type: "uuid" },
          { name: "type", type: "varchar", length: "50" },
          { name: "address", type: "text" },
          { name: "latitude", type: "decimal", precision: 10, scale: 7, isNullable: true },
          { name: "longitude", type: "decimal", precision: 10, scale: 7, isNullable: true },
          { name: "createdAt", type: "timestamp", default: "CURRENT_TIMESTAMP" },
          { name: "updatedAt", type: "timestamp", default: "CURRENT_TIMESTAMP" },
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      "crm_customer_addresses",
      new TableForeignKey({
        columnNames: ["customerId"],
        referencedColumnNames: ["id"],
        referencedTableName: "crm_customers",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createIndex(
      "crm_customer_addresses",
      new TableIndex({
        name: "IDX_crm_customer_addresses_customerId",
        columnNames: ["customerId"],
      })
    );

    // CRM Customer Notes table
    await queryRunner.createTable(
      new Table({
        name: "crm_customer_notes",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          { name: "customerId", type: "uuid" },
          { name: "createdBy", type: "uuid" },
          { name: "content", type: "text" },
          { name: "type", type: "varchar", length: "50", isNullable: true },
          { name: "createdAt", type: "timestamp", default: "CURRENT_TIMESTAMP" },
          { name: "updatedAt", type: "timestamp", default: "CURRENT_TIMESTAMP" },
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      "crm_customer_notes",
      new TableForeignKey({
        columnNames: ["customerId"],
        referencedColumnNames: ["id"],
        referencedTableName: "crm_customers",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createIndex(
      "crm_customer_notes",
      new TableIndex({
        name: "IDX_crm_customer_notes_customerId",
        columnNames: ["customerId"],
      })
    );

    // CRM Customer Documents table
    await queryRunner.createTable(
      new Table({
        name: "crm_customer_documents",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          { name: "customerId", type: "uuid" },
          { name: "type", type: "varchar", length: "50" },
          { name: "fileName", type: "varchar", length: "255" },
          { name: "filePath", type: "varchar", length: "500" },
          { name: "mimeType", type: "varchar", length: "100", isNullable: true },
          { name: "fileSize", type: "bigint", isNullable: true },
          { name: "createdAt", type: "timestamp", default: "CURRENT_TIMESTAMP" },
          { name: "updatedAt", type: "timestamp", default: "CURRENT_TIMESTAMP" },
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      "crm_customer_documents",
      new TableForeignKey({
        columnNames: ["customerId"],
        referencedColumnNames: ["id"],
        referencedTableName: "crm_customers",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createIndex(
      "crm_customer_documents",
      new TableIndex({
        name: "IDX_crm_customer_documents_customerId",
        columnNames: ["customerId"],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("crm_customer_documents");
    await queryRunner.dropTable("crm_customer_notes");
    await queryRunner.dropTable("crm_customer_addresses");
    await queryRunner.dropTable("crm_customer_contacts");
    await queryRunner.dropTable("crm_customers");
  }
}





