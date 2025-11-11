/**
 * Создание тестового пользователя для новой базы данных
 */

const { Client } = require('pg');
const bcrypt = require('bcrypt');

async function createTestUser() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'masterprofi_v2',
    user: 'masterprofi',
    password: 'MasterProfi2024!Secure',
  });

  try {
    await client.connect();
    console.log('✓ Подключение к базе данных успешно\n');

    const email = 'admin@masterprofi.com';
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Проверяем, существует ли уже пользователь
    const existingUser = await client.query(
      'SELECT id, email FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      console.log(`⚠ Пользователь ${email} уже существует`);
      console.log(`  ID: ${existingUser.rows[0].id}`);
      return;
    }

    // Создаем пользователя
    const result = await client.query(`
      INSERT INTO users (email, "passwordHash", role, "firstName", "lastName", "isActive", "emailVerified")
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, email, role, "firstName", "lastName";
    `, [
      email,
      hashedPassword,
      'admin',
      'Admin',
      'User',
      true,
      true
    ]);

    const user = result.rows[0];
    console.log('✅ Тестовый пользователь создан успешно!\n');
    console.log('📋 Данные для входа:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   ID: ${user.id}\n`);

    // Также создаем пользователя для тестирования с указанным email
    const testEmail = 'www.pascha.ru542@gmail.com';
    const testPassword = 'test123';
    const testHashedPassword = await bcrypt.hash(testPassword, 10);

    const existingTestUser = await client.query(
      'SELECT id, email FROM users WHERE email = $1',
      [testEmail]
    );

    if (existingTestUser.rows.length === 0) {
      const testResult = await client.query(`
        INSERT INTO users (email, "passwordHash", role, "firstName", "lastName", "isActive", "emailVerified")
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, email, role;
      `, [
        testEmail,
        testHashedPassword,
        'client',
        'Test',
        'User',
        true,
        true
      ]);

      console.log('✅ Тестовый пользователь для логина создан:');
      console.log(`   Email: ${testResult.rows[0].email}`);
      console.log(`   Password: ${testPassword}`);
      console.log(`   Role: ${testResult.rows[0].role}\n`);
    } else {
      console.log(`⚠ Пользователь ${testEmail} уже существует`);
    }

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createTestUser();

