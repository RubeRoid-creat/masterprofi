/**
 * Скрипт для создания новой базы данных PostgreSQL
 * Использование: node create-database-simple.js [имя_базы]
 */

const { Client } = require('pg');

const dbName = process.argv[2] || 'masterprofi_new';
const adminPassword = 'postgres_secure_2024';

async function createDatabase() {
  console.log('=== Создание новой базы данных PostgreSQL ===\n');
  console.log(`Имя базы данных: ${dbName}\n`);

  const adminClient = new Client({
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: adminPassword,
  });

  try {
    console.log('Подключение к PostgreSQL...');
    await adminClient.connect();
    console.log('✓ Подключено успешно\n');

    // Проверяем существование базы
    const checkDb = await adminClient.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );

    if (checkDb.rows.length > 0) {
      console.log(`База данных "${dbName}" уже существует.`);
      console.log('Удаление существующей базы данных...');
      
      // Завершаем все активные подключения
      await adminClient.query(`
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = $1
          AND pid <> pg_backend_pid();
      `, [dbName]);
      
      await adminClient.query(`DROP DATABASE IF EXISTS "${dbName}";`);
      console.log('✓ Старая база данных удалена\n');
    }

    // Создаем новую базу данных
    console.log(`Создание базы данных "${dbName}"...`);
    await adminClient.query(`CREATE DATABASE "${dbName}";`);
    console.log(`✓ База данных "${dbName}" создана`);

    // Проверяем пользователя masterprofi
    const userCheck = await adminClient.query(
      "SELECT 1 FROM pg_user WHERE usename = 'masterprofi'"
    );

    if (userCheck.rows.length === 0) {
      console.log('Создание пользователя masterprofi...');
      await adminClient.query(
        `CREATE USER masterprofi WITH PASSWORD 'MasterProfi2024!Secure';`
      );
      console.log('✓ Пользователь masterprofi создан');
    }

    // Предоставляем права
    console.log('Предоставление прав пользователю masterprofi...');
    await adminClient.query(`GRANT ALL PRIVILEGES ON DATABASE "${dbName}" TO masterprofi;`);
    console.log('✓ Права предоставлены');

    await adminClient.end();

    // Подключаемся к новой базе для проверки
    console.log(`\nПроверка подключения к новой базе данных...`);
    const testClient = new Client({
      host: 'localhost',
      port: 5432,
      database: dbName,
      user: 'masterprofi',
      password: 'MasterProfi2024!Secure',
    });

    await testClient.connect();
    console.log(`✓ Подключение к "${dbName}" успешно!`);
    
    const version = await testClient.query('SELECT version()');
    console.log(`✓ PostgreSQL: ${version.rows[0].version.split(',')[0]}`);
    
    await testClient.end();

    console.log('\n✅ База данных успешно создана!');
    console.log('\n📋 Данные для подключения:');
    console.log(`  Database: ${dbName}`);
    console.log('  Username: masterprofi');
    console.log('  Password: MasterProfi2024!Secure');
    console.log('  Host: localhost');
    console.log('  Port: 5432');
    
    console.log(`\n📝 Для использования новой базы данных обновите backend/.env:`);
    console.log(`   DB_NAME=${dbName}`);
    
  } catch (error) {
    console.error('\n❌ Ошибка:', error.message);
    if (error.message.includes('password authentication failed')) {
      console.error('\nВозможные решения:');
      console.error('1. Проверьте пароль пользователя postgres в скрипте');
      console.error('2. Или измените пароль в файле create-database-simple.js');
    }
    process.exit(1);
  }
}

createDatabase();

