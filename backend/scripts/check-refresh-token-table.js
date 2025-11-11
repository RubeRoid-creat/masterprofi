/**
 * Проверка таблицы refresh_token
 */

const { Client } = require('pg');

async function checkTable() {
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

    // Проверяем обе версии названия
    const tables = ['refresh_token', 'refresh_tokens'];
    
    for (const tableName of tables) {
      const result = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = $1;
      `, [tableName]);
      
      if (result.rows.length > 0) {
        console.log(`✓ Таблица "${tableName}" существует`);
        
        // Проверяем структуру
        const columns = await client.query(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_schema = 'public' AND table_name = $1
          ORDER BY ordinal_position;
        `, [tableName]);
        
        console.log(`  Колонок: ${columns.rows.length}`);
        columns.rows.forEach(col => {
          console.log(`    - ${col.column_name} (${col.data_type})`);
        });
      } else {
        console.log(`✗ Таблица "${tableName}" не существует`);
      }
    }

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

checkTable();

