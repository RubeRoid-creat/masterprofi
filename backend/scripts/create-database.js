/**
 * Скрипт для создания новой базы данных PostgreSQL
 */

const { Client } = require('pg');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createDatabase() {
  console.log('=== Создание новой базы данных PostgreSQL ===\n');

  // Подключаемся к системной базе postgres
  const adminClient = new Client({
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'postgres_secure_2024',
  });

  try {
    console.log('Подключение к PostgreSQL...');
    await adminClient.connect();
    console.log('✓ Подключено успешно\n');

    // Запрашиваем имя новой базы данных
    const dbName = await question('Введите имя новой базы данных (например: masterprofi_new): ') || 'masterprofi_new';
    
    // Проверяем, существует ли уже такая база
    const checkDb = await adminClient.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );

    if (checkDb.rows.length > 0) {
      const overwrite = await question(`База данных "${dbName}" уже существует. Пересоздать? (y/n): `);
      if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
        console.log('Отменено.');
        await adminClient.end();
        rl.close();
        return;
      }
      
      console.log('Удаление существующей базы данных...');
      // Завершаем все активные подключения
      await adminClient.query(`
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = $1
          AND pid <> pg_backend_pid();
      `, [dbName]);
      
      await adminClient.query(`DROP DATABASE IF EXISTS "${dbName}";`);
      console.log('✓ Старая база данных удалена');
    }

    // Создаем новую базу данных
    console.log(`\nСоздание базы данных "${dbName}"...`);
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
    
    // Проверяем версию
    const version = await testClient.query('SELECT version()');
    console.log(`✓ PostgreSQL версия: ${version.rows[0].version.split(',')[0]}`);
    
    await testClient.end();

    console.log('\n✅ База данных успешно создана!');
    console.log('\n📋 Данные для подключения:');
    console.log(`  Database: ${dbName}`);
    console.log('  Username: masterprofi');
    console.log('  Password: MasterProfi2024!Secure');
    console.log('  Host: localhost');
    console.log('  Port: 5432');
    
    console.log('\n📝 Для использования новой базы данных в backend:');
    console.log(`   Обновите DB_NAME в файле backend/.env на: ${dbName}`);
    
  } catch (error) {
    console.error('\n❌ Ошибка:', error.message);
    if (error.message.includes('password authentication failed')) {
      console.error('\nПопробуйте изменить пароль пользователя postgres в скрипте или');
      console.error('используйте другой способ подключения.');
    }
    process.exit(1);
  } finally {
    rl.close();
  }
}

createDatabase();

