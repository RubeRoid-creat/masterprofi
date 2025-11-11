import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1700000000000 implements MigrationInterface {
  name = "InitialSchema1700000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Создание enum для ролей пользователей
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "user_role_enum" AS ENUM('client', 'master', 'admin');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Создание enum для статусов заказов
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "order_status_enum" AS ENUM('created', 'assigned', 'in_progress', 'completed', 'cancelled');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Создание enum для типов бонусов
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "bonus_type_enum" AS ENUM('commission', 'referral', 'bonus', 'withdrawal');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Создание enum для статусов бонусов
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "bonus_status_enum" AS ENUM('pending', 'paid', 'cancelled');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Создание enum для типов сообщений
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "message_type_enum" AS ENUM('text', 'image', 'file');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Включаем расширение для UUID (если еще не включено)
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `);

    // Таблица пользователей
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "email" varchar NOT NULL UNIQUE,
        "phone" varchar UNIQUE,
        "passwordHash" varchar NOT NULL,
        "role" "user_role_enum" NOT NULL DEFAULT 'client',
        "firstName" varchar,
        "lastName" varchar,
        "avatar" varchar,
        "isActive" boolean NOT NULL DEFAULT true,
        "emailVerified" boolean NOT NULL DEFAULT false,
        "referralCode" varchar UNIQUE,
        "referrerId" uuid,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "FK_users_referrer" FOREIGN KEY ("referrerId") REFERENCES "users"("id") ON DELETE SET NULL
      );
    `);

    // Таблица профилей мастеров
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "master_profile" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL UNIQUE,
        "referralsCount" integer NOT NULL DEFAULT 0,
        "totalEarnings" numeric(10,2) NOT NULL DEFAULT 0,
        "totalCommissions" numeric(10,2) NOT NULL DEFAULT 0,
        "availableBalance" numeric(10,2) NOT NULL DEFAULT 0,
        "withdrawnAmount" numeric(10,2) NOT NULL DEFAULT 0,
        "reviewsCount" integer NOT NULL DEFAULT 0,
        "averageRating" numeric(3,2) NOT NULL DEFAULT 0,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "FK_master_profile_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);

    // Таблица рефералов
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "referral" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "referrerId" uuid NOT NULL,
        "referredId" uuid NOT NULL,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "FK_referral_referrer" FOREIGN KEY ("referrerId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_referral_referred" FOREIGN KEY ("referredId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_referral_pair" UNIQUE ("referrerId", "referredId")
      );
    `);

    // Таблица заказов
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "orders" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "clientId" uuid NOT NULL,
        "masterId" uuid,
        "totalAmount" numeric(10,2) NOT NULL DEFAULT 0,
        "description" text,
        "status" "order_status_enum" NOT NULL DEFAULT 'created',
        "address" varchar,
        "latitude" numeric(10,7),
        "longitude" numeric(10,7),
        "scheduledAt" timestamp,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "FK_orders_client" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_orders_master" FOREIGN KEY ("masterId") REFERENCES "users"("id") ON DELETE SET NULL
      );
    `);

    // Таблица истории заказов
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "order_history" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "orderId" uuid NOT NULL,
        "action" varchar NOT NULL,
        "description" text,
        "userId" uuid,
        "oldValue" text,
        "newValue" text,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "FK_order_history_order" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_order_history_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL
      );
    `);

    // Таблица платежей
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "payment" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "orderId" uuid,
        "userId" uuid NOT NULL,
        "amount" numeric(10,2) NOT NULL,
        "status" varchar NOT NULL DEFAULT 'pending',
        "paymentMethod" varchar,
        "transactionId" varchar,
        "provider" varchar,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "FK_payment_order" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_payment_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);

    // Таблица бонусов
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "bonus" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "amount" numeric(10,2) NOT NULL,
        "type" "bonus_type_enum" NOT NULL,
        "status" "bonus_status_enum" NOT NULL DEFAULT 'pending',
        "orderId" uuid,
        "description" text,
        "level" integer,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "FK_bonus_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_bonus_order" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL
      );
    `);

    // Таблица чатов
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "chat" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "orderId" uuid,
        "clientId" uuid NOT NULL,
        "masterId" uuid NOT NULL,
        "lastMessageAt" timestamp,
        "unreadCountClient" integer NOT NULL DEFAULT 0,
        "unreadCountMaster" integer NOT NULL DEFAULT 0,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "FK_chat_order" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_chat_client" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_chat_master" FOREIGN KEY ("masterId") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);

    // Таблица сообщений
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "message" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "chatId" uuid NOT NULL,
        "senderId" uuid NOT NULL,
        "content" text NOT NULL,
        "type" "message_type_enum" NOT NULL DEFAULT 'text',
        "fileUrl" varchar,
        "readAt" timestamp,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "FK_message_chat" FOREIGN KEY ("chatId") REFERENCES "chat"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_message_sender" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);

    // Таблица отзывов
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "review" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "orderId" uuid NOT NULL UNIQUE,
        "clientId" uuid NOT NULL,
        "masterId" uuid NOT NULL,
        "rating" integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
        "comment" text,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "FK_review_order" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_review_client" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_review_master" FOREIGN KEY ("masterId") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);

    // Таблица слотов расписания
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "schedule_slot" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "masterId" uuid NOT NULL,
        "startTime" timestamp NOT NULL,
        "endTime" timestamp NOT NULL,
        "isAvailable" boolean NOT NULL DEFAULT true,
        "orderId" uuid,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "FK_schedule_slot_master" FOREIGN KEY ("masterId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_schedule_slot_order" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL
      );
    `);

    // Таблица аудита
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "audit_log" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "action" varchar NOT NULL,
        "entityType" varchar NOT NULL,
        "entityId" uuid,
        "userId" uuid,
        "description" text,
        "oldValues" jsonb,
        "newValues" jsonb,
        "ipAddress" varchar,
        "userAgent" varchar,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "FK_audit_log_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL
      );
    `);

    // Таблица refresh токенов
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "refresh_token" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "token" varchar NOT NULL UNIQUE,
        "userId" uuid NOT NULL,
        "expiresAt" timestamp NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "ipAddress" varchar,
        "userAgent" varchar,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "FK_refresh_token_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);

    // Индексы для производительности
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_users_email" ON "users"("email");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_users_referralCode" ON "users"("referralCode");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_orders_clientId" ON "orders"("clientId");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_orders_masterId" ON "orders"("masterId");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_orders_status" ON "orders"("status");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_payment_userId" ON "payment"("userId");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_payment_status" ON "payment"("status");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_chat_clientId" ON "chat"("clientId");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_chat_masterId" ON "chat"("masterId");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_message_chatId" ON "message"("chatId");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_review_masterId" ON "review"("masterId");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_audit_log_userId" ON "audit_log"("userId");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_audit_log_entityType" ON "audit_log"("entityType");`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удаление таблиц в обратном порядке
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_log";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "refresh_token";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "schedule_slot";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "review";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "message";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "chat";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "bonus";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "payment";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "order_history";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "orders";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "referral";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "master_profile";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users";`);

    // Удаление enum типов
    await queryRunner.query(`DROP TYPE IF EXISTS "message_type_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "bonus_status_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "bonus_type_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "order_status_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_role_enum";`);
  }
}

