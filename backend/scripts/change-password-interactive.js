/**
 * Интерактивный скрипт для изменения пароля пользователя PostgreSQL
 * Запрашивает данные для подключения у пользователя
 */

const readline = require('readline');
const { Client } = require('pg');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function changePassword() {
  console.log('=== Настройка пароля PostgreSQL ===\n');
  
  console.log('Для изменения пароля пользователя masterprofi нужно подключиться к PostgreSQL');
  console.log('с правами суперпользователя (обычно это пользователь postgres).\n');
  
  const adminUser = await question('Введите имя пользователя для подключения (обычно postgres): ') || 'postgres';
  const adminPassword = await question('Введите пароль для этого пользователя: ');
  const newPassword = await question('Введите новый пароль для пользователя masterprofi (или Enter для MasterProfi2024!Secure): ') || 'MasterProfi2024!Secure';

  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    user: adminUser,
    password: adminPassword,
  });

  try {
    console.log('\nПодключение к PostgreSQL...');
    await client.connect();
    console.log('✓ Подключено успешно\n');

    // Проверяем существование пользователя
    const userCheck = await client.query(
      "SELECT 1 FROM pg_user WHERE usename = 'masterprofi'"
    );

    if (userCheck.rows.length === 0) {
      console.log('Пользователь masterprofi не найден, создаем...');
      await client.query(
        `CREATE USER masterprofi WITH PASSWORD '${newPassword}';`
      );
      console.log('✓ Пользователь masterprofi создан');
    } else {
      console.log('Изменение пароля пользователя masterprofi...');
      await client.query(
        `ALTER USER masterprofi WITH PASSWORD '${newPassword}';`
      );
      console.log('✓ Пароль успешно изменен');
    }

    // Проверяем базу данных
    const dbCheck = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'masterprofi'"
    );

    if (dbCheck.rows.length === 0) {
      console.log('База данных masterprofi не найдена, создаем...');
      await client.query('CREATE DATABASE masterprofi;');
      console.log('✓ База данных masterprofi создана');
    }

    // Даем права
    await client.query('GRANT ALL PRIVILEGES ON DATABASE masterprofi TO masterprofi;');
    console.log('✓ Права предоставлены');

    // Проверяем подключение с новым паролем
    console.log('\nПроверка подключения с новым паролем...');
    const testClient = new Client({
      host: 'localhost',
      port: 5432,
      database: 'masterprofi',
      user: 'masterprofi',
      password: newPassword,
    });

    await testClient.connect();
    console.log('✓ Подключение с новым паролем работает!');
    await testClient.end();

    console.log('\n✅ Настройка завершена успешно!');
    console.log('\n📋 Новые данные для подключения:');
    console.log(`  Username: masterprofi`);
    console.log(`  Password: ${newPassword}`);
    console.log('  Database: masterprofi');
    console.log('  Host: localhost');
    console.log('  Port: 5432');
  } catch (error) {
    console.error('\n❌ Ошибка:', error.message);
    console.error('\nВозможные причины:');
    console.error('  1. Неправильный пароль администратора');
    console.error('  2. PostgreSQL не настроен на локальные подключения');
    console.error('  3. Неправильный порт или хост');
    process.exit(1);
  } finally {
    await client.end();
    rl.close();
  }
}

changePassword();

