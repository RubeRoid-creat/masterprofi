/**
 * Скрипт для автоматического сброса пароля PostgreSQL
 * ТРЕБУЕТСЯ: временно изменить pg_hba.conf на trust
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const pgHbaPath = 'C:\\Program Files\\PostgreSQL\\18\\data\\pg_hba.conf';
const newPassword = 'MasterProfi2024!Secure';

async function resetPassword() {
  console.log('=== Автоматический сброс пароля PostgreSQL ===\n');
  
  // Шаг 1: Проверяем файл pg_hba.conf
  if (!fs.existsSync(pgHbaPath)) {
    console.error(`❌ Файл не найден: ${pgHbaPath}`);
    console.error('\nПожалуйста, выполните следующие шаги вручную:');
    console.error('1. Откройте PowerShell от имени администратора');
    console.error(`2. Откройте файл: notepad "${pgHbaPath}"`);
    console.error('3. Найдите строки с md5 и замените на trust');
    console.error('4. Перезапустите службу PostgreSQL');
    console.error('5. Запустите этот скрипт снова');
    process.exit(1);
  }

  console.log('Шаг 1: Проверка файла pg_hba.conf...');
  let pgHbaContent = fs.readFileSync(pgHbaPath, 'utf8');
  
  // Проверяем, есть ли trust
  if (!pgHbaContent.includes('127.0.0.1/32            trust')) {
    console.log('⚠️  Файл pg_hba.conf не настроен на trust');
    console.log('\nПожалуйста, выполните следующие шаги:');
    console.log('1. Откройте PowerShell от имени администратора');
    console.log(`2. Выполните: notepad "${pgHbaPath}"`);
    console.log('3. Найдите строки:');
    console.log('   host    all             all             127.0.0.1/32            md5');
    console.log('   host    all             all             ::1/128                 md5');
    console.log('4. Замените md5 на trust');
    console.log('5. Сохраните файл');
    console.log('6. Перезапустите службу: Restart-Service postgresql-x64-18');
    console.log('7. Запустите этот скрипт снова');
    process.exit(1);
  }

  console.log('✓ Файл pg_hba.conf настроен на trust\n');

  // Шаг 2: Подключаемся без пароля
  console.log('Шаг 2: Подключение к PostgreSQL...');
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: '', // trust не требует пароля
  });

  try {
    await client.connect();
    console.log('✓ Подключено успешно\n');

    // Шаг 3: Изменяем пароли
    console.log('Шаг 3: Изменение паролей...');
    
    // Изменяем пароль postgres
    await client.query(`ALTER USER postgres WITH PASSWORD 'postgres_secure_2024';`);
    console.log('✓ Пароль пользователя postgres изменен на: postgres_secure_2024');

    // Проверяем и создаем пользователя masterprofi
    const userCheck = await client.query(
      "SELECT 1 FROM pg_user WHERE usename = 'masterprofi'"
    );

    if (userCheck.rows.length === 0) {
      console.log('Создание пользователя masterprofi...');
      await client.query(
        `CREATE USER masterprofi WITH PASSWORD '${newPassword}';`
      );
      console.log('✓ Пользователь masterprofi создан');
    } else {
      await client.query(
        `ALTER USER masterprofi WITH PASSWORD '${newPassword}';`
      );
      console.log('✓ Пароль пользователя masterprofi изменен');
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

    // Шаг 4: Проверяем подключение с новым паролем
    console.log('\nШаг 4: Проверка подключения с новым паролем...');
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

    console.log('\n✅ Все настроено успешно!');
    console.log('\n📋 Новые данные для подключения:');
    console.log('  Username: masterprofi');
    console.log('  Password: MasterProfi2024!Secure');
    console.log('  Database: masterprofi');
    console.log('  Host: localhost');
    console.log('  Port: 5432');
    console.log('\n⚠️  ВАЖНО: Верните md5 в pg_hba.conf для безопасности!');
    console.log('   Затем перезапустите службу PostgreSQL.');
  } catch (error) {
    console.error('\n❌ Ошибка:', error.message);
    process.exit(1);
  }
}

resetPassword();

