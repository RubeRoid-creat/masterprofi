/**
 * Скрипт для попытки подключения с распространенными паролями
 */

const { Client } = require('pg');

const commonPasswords = [
  '',
  'postgres',
  'root',
  'admin',
  'password',
  '123456',
  'masterprofi_pass',
  'MasterProfi2024!Secure',
];

async function tryPasswords() {
  console.log('Попытка подключения с распространенными паролями...\n');

  for (const password of commonPasswords) {
    const displayPassword = password || '(пустой)';
    try {
      console.log(`Пробую пароль: ${displayPassword}...`);
      const client = new Client({
        host: 'localhost',
        port: 5432,
        database: 'postgres',
        user: 'postgres',
        password: password,
      });

      await client.connect();
      console.log(`✅ УСПЕХ! Пароль: ${displayPassword}\n`);

      // Теперь меняем пароли
      console.log('Изменение пароля пользователя postgres...');
      await client.query(`ALTER USER postgres WITH PASSWORD 'postgres_secure_2024';`);
      console.log('✓ Пароль postgres изменен на: postgres_secure_2024');

      // Проверяем и создаем пользователя masterprofi
      const userCheck = await client.query(
        "SELECT 1 FROM pg_user WHERE usename = 'masterprofi'"
      );

      if (userCheck.rows.length === 0) {
        console.log('Создание пользователя masterprofi...');
        await client.query(
          `CREATE USER masterprofi WITH PASSWORD 'MasterProfi2024!Secure';`
        );
        console.log('✓ Пользователь masterprofi создан');
      } else {
        console.log('Изменение пароля пользователя masterprofi...');
        await client.query(
          `ALTER USER masterprofi WITH PASSWORD 'MasterProfi2024!Secure';`
        );
        console.log('✓ Пароль masterprofi изменен');
      }

      // Проверяем базу данных
      const dbCheck = await client.query(
        "SELECT 1 FROM pg_database WHERE datname = 'masterprofi'"
      );

      if (dbCheck.rows.length === 0) {
        console.log('Создание базы данных masterprofi...');
        await client.query('CREATE DATABASE masterprofi;');
        console.log('✓ База данных masterprofi создана');
      }

      await client.query('GRANT ALL PRIVILEGES ON DATABASE masterprofi TO masterprofi;');
      console.log('✓ Права предоставлены');

      await client.end();
      console.log('\n✅ Все настроено успешно!');
      return;
    } catch (error) {
      console.log(`✗ Не подошел: ${error.message.split('\n')[0]}`);
    }
  }

  console.log('\n❌ Ни один из распространенных паролей не подошел.');
  console.log('\nПопробуйте один из вариантов:');
  console.log('1. Сбросить пароль через pg_hba.conf (см. reset-postgres-password.md)');
  console.log('2. Если PostgreSQL в Docker - перезапустить контейнер');
  console.log('3. Вспомнить пароль или обратиться к администратору');
}

tryPasswords();

