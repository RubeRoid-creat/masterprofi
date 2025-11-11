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
    console.log('✓ Подключение к masterprofi_v2 успешно!');
    return client.query('SELECT current_database(), current_user');
  })
  .then((result) => {
    console.log('✓ База данных:', result.rows[0].current_database);
    console.log('✓ Пользователь:', result.rows[0].current_user);
    console.log('\n✅ Backend может подключиться к новой базе данных masterprofi_v2!');
    client.end();
    process.exit(0);
  })
  .catch((error) => {
    console.error('✗ Ошибка подключения:', error.message);
    client.end();
    process.exit(1);
  });

