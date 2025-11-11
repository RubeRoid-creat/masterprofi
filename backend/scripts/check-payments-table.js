/**
 * Проверка структуры таблицы payments/payment
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
    const tables = ['payment', 'payments'];
    
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

        // Проверяем внешние ключи
        const foreignKeys = await client.query(`
          SELECT
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
          FROM information_schema.table_constraints AS tc
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
          WHERE tc.constraint_type = 'FOREIGN KEY' 
            AND tc.table_name = $1;
        `, [tableName]);

        if (foreignKeys.rows.length > 0) {
          console.log(`  Внешние ключи:`);
          foreignKeys.rows.forEach(fk => {
            console.log(`    - ${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name}`);
          });
        }
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

