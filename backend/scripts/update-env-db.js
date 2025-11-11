const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
const newDbName = 'masterprofi_v2';

let content = fs.readFileSync(envPath, 'utf8');

// Заменяем DB_NAME
content = content.replace(/^DB_NAME=.*$/m, `DB_NAME=${newDbName}`);

fs.writeFileSync(envPath, content, 'utf8');

console.log(`✓ Файл .env обновлен: DB_NAME=${newDbName}`);
console.log('\nТекущие настройки БД:');
const lines = content.split('\n');
lines.forEach(line => {
  if (line.startsWith('DB_')) {
    console.log(`  ${line}`);
  }
});

