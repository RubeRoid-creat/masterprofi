const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'masterprofi_v2',
  user: 'masterprofi',
  password: 'MasterProfi2024!Secure',
});

client.connect()
  .then(() => {
    console.log('✓ Подключено к masterprofi_v2\n');
    return client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
  })
  .then((result) => {
    console.log(`📊 Найдено таблиц: ${result.rows.length}\n`);
    console.log('Список таблиц:');
    result.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.table_name}`);
    });
    
    // Проверяем ключевые таблицы
    const keyTables = ['devices', 'sync_changes', 'crm_contacts', 'crm_deals', 'crm_sync_status'];
    console.log('\n✓ Проверка ключевых таблиц:');
    keyTables.forEach(table => {
      const exists = result.rows.some(r => r.table_name === table);
      console.log(`  ${exists ? '✓' : '✗'} ${table}`);
    });
    
    client.end();
    process.exit(0);
  })
  .catch((error) => {
    console.error('✗ Ошибка:', error.message);
    client.end();
    process.exit(1);
  });

