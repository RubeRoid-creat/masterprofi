/**
 * Проверка столбцов в таблице users
 */

const { Client } = require('pg');

async function checkUsersColumns() {
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

    // Проверяем все столбцы в таблице users
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'users'
      ORDER BY ordinal_position;
    `);

    console.log('📊 Столбцы в таблице users:');
    result.rows.forEach((row) => {
      console.log(`  - ${row.column_name} (${row.data_type}, nullable: ${row.is_nullable})`);
    });

    // Проверяем конкретно invited_by_id и referrerId
    console.log('\n🔍 Проверка MLM полей:');
    const mlmColumns = result.rows.filter(
      (row) => row.column_name.includes('invited') || row.column_name.includes('referrer')
    );
    
    if (mlmColumns.length === 0) {
      console.log('  ✗ Столбцы invited_by_id и referrerId не найдены');
    } else {
      mlmColumns.forEach((row) => {
        console.log(`  ✓ ${row.column_name} (${row.data_type})`);
      });
    }

    // Проверяем, есть ли referrerId
    const hasReferrerId = result.rows.some((row) => row.column_name === 'referrerId');
    const hasInvitedById = result.rows.some((row) => row.column_name === 'invited_by_id');

    console.log('\n📋 Итог:');
    console.log(`  - referrerId: ${hasReferrerId ? '✓' : '✗'}`);
    console.log(`  - invited_by_id: ${hasInvitedById ? '✓' : '✗'}`);

    if (!hasInvitedById) {
      console.log('\n⚠ Нужно добавить столбец invited_by_id в таблицу users');
    }

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

checkUsersColumns();

