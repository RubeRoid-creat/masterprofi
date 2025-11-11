/**
 * Скрипт для изменения пароля пользователя PostgreSQL
 */

const { Client } = require('pg');

async function changePassword() {
  const newPassword = 'MasterProfi2024!Secure';

  // Сначала пробуем подключиться с пользователем postgres (по умолчанию)
  const clients = [
    {
      name: 'postgres (без пароля)',
      config: {
        host: 'localhost',
        port: 5432,
        database: 'postgres',
        user: 'postgres',
        password: '', // Пробуем без пароля
      }
    },
    {
      name: 'postgres (пароль postgres)',
      config: {
        host: 'localhost',
        port: 5432,
        database: 'postgres',
        user: 'postgres',
        password: 'postgres',
      }
    },
    {
      name: 'masterprofi (старый пароль)',
      config: {
        host: 'localhost',
        port: 5432,
        database: 'masterprofi',
        user: 'masterprofi',
        password: 'masterprofi_pass',
      }
    }
  ];

  let connectedClient = null;
  let clientName = '';

  // Пробуем подключиться с разными вариантами
  for (const clientInfo of clients) {
    try {
      console.log(`Попытка подключения как ${clientInfo.name}...`);
      const client = new Client(clientInfo.config);
      await client.connect();
      console.log(`✓ Подключено успешно как ${clientInfo.name}`);
      connectedClient = client;
      clientName = clientInfo.name;
      break;
    } catch (error) {
      console.log(`✗ Не удалось подключиться как ${clientInfo.name}: ${error.message}`);
      continue;
    }
  }

  if (!connectedClient) {
    console.error('\n❌ Не удалось подключиться к PostgreSQL ни с одним из вариантов.');
    console.error('Пожалуйста, укажите правильные данные для подключения:');
    console.error('  - Пользователь (обычно postgres или masterprofi)');
    console.error('  - Пароль');
    process.exit(1);
  }

  try {
    console.log(`\nПроверка существования пользователя masterprofi...`);
    const userCheck = await connectedClient.query(
      "SELECT 1 FROM pg_user WHERE usename = 'masterprofi'"
    );

    if (userCheck.rows.length === 0) {
      console.log('Пользователь masterprofi не найден, создаем...');
      await connectedClient.query(
        `CREATE USER masterprofi WITH PASSWORD '${newPassword}';`
      );
      console.log('✓ Пользователь masterprofi создан');
    } else {
      console.log('✓ Пользователь masterprofi существует');
      console.log('Изменение пароля...');
      await connectedClient.query(
        `ALTER USER masterprofi WITH PASSWORD '${newPassword}';`
      );
      console.log('✓ Пароль успешно изменен');
    }

    // Даем права на базу данных
    console.log('Проверка базы данных masterprofi...');
    const dbCheck = await connectedClient.query(
      "SELECT 1 FROM pg_database WHERE datname = 'masterprofi'"
    );

    if (dbCheck.rows.length === 0) {
      console.log('База данных masterprofi не найдена, создаем...');
      await connectedClient.query('CREATE DATABASE masterprofi;');
      console.log('✓ База данных masterprofi создана');
    } else {
      console.log('✓ База данных masterprofi существует');
    }

    // Даем права пользователю на базу данных
    await connectedClient.query('GRANT ALL PRIVILEGES ON DATABASE masterprofi TO masterprofi;');
    console.log('✓ Права на базу данных предоставлены');

    // Проверяем подключение с новым паролем
    console.log('\nПроверка подключения с новым паролем...');
    const testClient = new Client({
      host: 'localhost',
      port: 5432,
      database: 'masterprofi',
      user: 'masterprofi',
      password: newPassword,
    });

    await testClient.connect();
    console.log('✓ Подключение с новым паролем работает!');
    await testClient.end();

    console.log('\n✅ Настройка завершена успешно!');
    console.log('\n📋 Новые данные для подключения:');
    console.log('  Username: masterprofi');
    console.log('  Password: MasterProfi2024!Secure');
    console.log('  Database: masterprofi');
    console.log('  Host: localhost');
    console.log('  Port: 5432');
  } catch (error) {
    console.error('\n❌ Ошибка:', error.message);
    process.exit(1);
  } finally {
    await connectedClient.end();
  }
}

changePassword();
