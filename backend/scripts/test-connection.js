const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'masterprofi',
  user: 'masterprofi',
  password: 'MasterProfi2024!Secure',
});

client.connect()
  .then(() => {
    console.log('✓ Подключение к PostgreSQL успешно!');
    return client.query('SELECT version()');
  })
  .then((result) => {
    console.log('✓ Версия PostgreSQL:', result.rows[0].version.split(',')[0]);
    return client.query('SELECT current_database(), current_user');
  })
  .then((result) => {
    console.log('✓ База данных:', result.rows[0].current_database);
    console.log('✓ Пользователь:', result.rows[0].current_user);
    console.log('\n✅ Все работает! Backend может подключиться к базе данных.');
    client.end();
    process.exit(0);
  })
  .catch((error) => {
    console.error('✗ Ошибка подключения:', error.message);
    client.end();
    process.exit(1);
  });

