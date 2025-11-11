/**
 * Скрипт для исправления прав доступа к схеме public в новой базе данных
 */

const { Client } = require('pg');

const adminClient = new Client({
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres_secure_2024',
});

async function fixPermissions() {
  console.log('=== Исправление прав доступа к базе данных ===\n');

  try {
    await adminClient.connect();
    console.log('✓ Подключено к PostgreSQL\n');

    const dbName = 'masterprofi_v2';
    const username = 'masterprofi';

    console.log(`Предоставление прав на схему public в базе данных "${dbName}"...`);
    
    await adminClient.end();
    
    // Подключаемся напрямую к целевой базе данных
    const dbClient = new Client({
      host: 'localhost',
      port: 5432,
      database: dbName,
      user: 'postgres',
      password: 'postgres_secure_2024',
    });
    
    await dbClient.connect();
    console.log(`✓ Подключено к базе данных "${dbName}"`);
    
    // Предоставляем права на схему public
    await dbClient.query(`GRANT ALL ON SCHEMA public TO ${username};`);
    console.log('✓ Права на схему public предоставлены');

    await dbClient.query(`GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ${username};`);
    console.log('✓ Права на все таблицы предоставлены');

    await dbClient.query(`GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ${username};`);
    console.log('✓ Права на все последовательности предоставлены');

    // Устанавливаем права по умолчанию для будущих объектов
    await dbClient.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ${username};`);
    console.log('✓ Права по умолчанию для таблиц установлены');

    await dbClient.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ${username};`);
    console.log('✓ Права по умолчанию для последовательностей установлены');

    // Делаем пользователя владельцем схемы public (опционально, но помогает)
    await dbClient.query(`ALTER SCHEMA public OWNER TO ${username};`);
    console.log('✓ Пользователь назначен владельцем схемы public');
    
    await dbClient.end();

    console.log('\n✅ Права доступа успешно настроены!');
    
  } catch (error) {
    console.error('\n❌ Ошибка:', error.message);
    
    // Если ошибка с подключением к базе, попробуем другой способ
    if (error.message.includes('database') || error.message.includes('не существует')) {
      console.log('\nПопробуем другой способ...');
      await adminClient.end();
      
      // Подключаемся напрямую к базе данных
      const dbClient = new Client({
        host: 'localhost',
        port: 5432,
        database: 'masterprofi_v2',
        user: 'postgres',
        password: 'postgres_secure_2024',
      });
      
      await dbClient.connect();
      console.log('✓ Подключено к masterprofi_v2');
      
      await dbClient.query(`GRANT ALL ON SCHEMA public TO masterprofi;`);
      await dbClient.query(`GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO masterprofi;`);
      await dbClient.query(`GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO masterprofi;`);
      await dbClient.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO masterprofi;`);
      await dbClient.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO masterprofi;`);
      await dbClient.query(`ALTER SCHEMA public OWNER TO masterprofi;`);
      
      console.log('✅ Права доступа успешно настроены!');
      await dbClient.end();
    } else {
      process.exit(1);
    }
  } finally {
    // Уже закрыто выше
  }
}

fixPermissions();

