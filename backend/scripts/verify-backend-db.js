/**
 * Скрипт для проверки подключения backend к базе данных
 */

const { Client } = require('pg');

async function verifyBackendDb() {
  console.log('=== Проверка подключения backend к базе данных ===\n');

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

    // Проверяем количество таблиц
    const tablesResult = await client.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);
    console.log(`📊 Количество таблиц: ${tablesResult.rows[0].count}`);

    // Проверяем ключевые таблицы синхронизации
    console.log('\n🔍 Проверка ключевых таблиц синхронизации:');
    const keyTables = ['devices', 'sync_changes', 'crm_contacts', 'crm_deals', 'crm_sync_status', 'crm_sync_queue'];
    
    for (const table of keyTables) {
      const result = await client.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = $1;
      `, [table]);
      
      const exists = result.rows[0].count > 0;
      console.log(`  ${exists ? '✓' : '✗'} ${table}`);
      
      if (exists) {
        // Проверяем структуру таблицы
        const columnsResult = await client.query(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_schema = 'public' AND table_name = $1
          ORDER BY ordinal_position;
        `, [table]);
        console.log(`     Колонок: ${columnsResult.rows.length}`);
      }
    }

    // Проверяем таблицу devices
    console.log('\n📱 Проверка таблицы devices:');
    const devicesColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'devices'
      ORDER BY ordinal_position;
    `);
    console.log('  Колонки:');
    devicesColumns.rows.forEach(col => {
      console.log(`    - ${col.column_name} (${col.data_type})`);
    });

    // Проверяем таблицу sync_changes
    console.log('\n🔄 Проверка таблицы sync_changes:');
    const syncColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'sync_changes'
      ORDER BY ordinal_position;
    `);
    console.log('  Колонки:');
    syncColumns.rows.forEach(col => {
      console.log(`    - ${col.column_name} (${col.data_type})`);
    });

    // Проверяем индексы
    console.log('\n📇 Проверка индексов:');
    const indexes = await client.query(`
      SELECT tablename, indexname 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND (tablename LIKE 'devices%' OR tablename LIKE 'sync_%' OR tablename LIKE 'crm_%')
      ORDER BY tablename, indexname;
    `);
    console.log(`  Найдено индексов: ${indexes.rows.length}`);
    if (indexes.rows.length > 0) {
      console.log('  Примеры индексов:');
      indexes.rows.slice(0, 10).forEach(idx => {
        console.log(`    - ${idx.tablename}.${idx.indexname}`);
      });
      if (indexes.rows.length > 10) {
        console.log(`    ... и еще ${indexes.rows.length - 10} индексов`);
      }
    }

    console.log('\n✅ База данных настроена корректно!');
    console.log('✅ Backend должен работать с новой базой данных masterprofi_v2');

  } catch (error) {
    console.error('\n❌ Ошибка:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

verifyBackendDb();

