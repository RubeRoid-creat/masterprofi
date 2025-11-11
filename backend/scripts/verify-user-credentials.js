/**
 * Проверка учетных данных пользователя
 */

const { Client } = require('pg');
const bcrypt = require('bcrypt');

async function verifyCredentials() {
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

    const email = 'www.pascha.ru542@gmail.com';
    const testPassword = 'test123';

    // Проверяем пользователя
    const result = await client.query(
      'SELECT id, email, "passwordHash", role, "isActive", "emailVerified" FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      console.log(`✗ Пользователь ${email} не найден`);
      console.log('\nСоздаю пользователя...\n');
      
      // Создаем пользователя
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      const createResult = await client.query(`
        INSERT INTO users (email, "passwordHash", role, "firstName", "lastName", "isActive", "emailVerified")
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, email, role;
      `, [
        email,
        hashedPassword,
        'client',
        'Test',
        'User',
        true,
        true
      ]);

      console.log('✅ Пользователь создан:');
      console.log(`   Email: ${createResult.rows[0].email}`);
      console.log(`   Password: ${testPassword}`);
      console.log(`   Role: ${createResult.rows[0].role}\n`);
      return;
    }

    const user = result.rows[0];
    console.log(`✓ Пользователь найден: ${user.email}`);
    console.log(`  ID: ${user.id}`);
    console.log(`  Role: ${user.role}`);
    console.log(`  isActive: ${user.isActive}`);
    console.log(`  emailVerified: ${user.emailVerified}\n`);

    // Проверяем пароль
    console.log('🔐 Проверка пароля...');
    const passwordMatch = await bcrypt.compare(testPassword, user.passwordHash);
    
    if (passwordMatch) {
      console.log('✓ Пароль "test123" корректен');
    } else {
      console.log('✗ Пароль "test123" не совпадает');
      console.log('\nПробуем сбросить пароль...\n');
      
      // Сбрасываем пароль
      const newHashedPassword = await bcrypt.hash(testPassword, 10);
      await client.query(
        'UPDATE users SET "passwordHash" = $1 WHERE email = $2',
        [newHashedPassword, email]
      );
      
      console.log('✅ Пароль сброшен на "test123"');
      
      // Проверяем снова
      const verifyMatch = await bcrypt.compare(testPassword, newHashedPassword);
      if (verifyMatch) {
        console.log('✓ Новый пароль проверен успешно');
      }
    }

    // Также проверяем администратора
    console.log('\n👤 Проверка администратора:');
    const adminResult = await client.query(
      'SELECT id, email, role, "isActive" FROM users WHERE email = $1',
      ['admin@masterprofi.com']
    );

    if (adminResult.rows.length > 0) {
      const admin = adminResult.rows[0];
      console.log(`✓ Администратор найден: ${admin.email}`);
      console.log(`  Role: ${admin.role}`);
      console.log(`  isActive: ${admin.isActive}`);
      console.log(`  Password: admin123`);
    } else {
      console.log('✗ Администратор не найден');
    }

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

verifyCredentials();

