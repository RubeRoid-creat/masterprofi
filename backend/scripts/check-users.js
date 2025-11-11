/**
 * Проверка пользователей в базе данных
 */

const { Client } = require('pg');
const bcrypt = require('bcrypt');

async function checkUsers() {
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

    // Проверяем всех пользователей
    const result = await client.query(`
      SELECT id, email, role, "firstName", "lastName", "isActive", "createdAt"
      FROM users
      ORDER BY "createdAt" DESC
      LIMIT 10;
    `);

    console.log(`📊 Пользователей в базе: ${result.rows.length}\n`);

    if (result.rows.length === 0) {
      console.log('⚠ Пользователей нет. Нужно создать тестового пользователя.\n');
      
      // Предлагаем создать тестового пользователя
      console.log('Создать тестового пользователя? (email: admin@masterprofi.com, password: admin123)');
    } else {
      console.log('👥 Пользователи:');
      result.rows.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.email} (${user.role}) - ${user.isActive ? 'активен' : 'неактивен'}`);
      });
    }

    // Проверяем конкретный email
    const email = 'www.pascha.ru542@gmail.com';
    const userResult = await client.query(
      'SELECT id, email, role, "isActive" FROM users WHERE email = $1',
      [email]
    );

    console.log(`\n🔍 Проверка email: ${email}`);
    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      console.log(`  ✓ Пользователь найден: ${user.email} (${user.role}, ${user.isActive ? 'активен' : 'неактивен'})`);
    } else {
      console.log(`  ✗ Пользователь не найден`);
    }

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

checkUsers();

