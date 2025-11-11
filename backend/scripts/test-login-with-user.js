/**
 * Тест логина с созданным пользователем
 */

const http = require('http');

function testLogin(email, password) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      email,
      password
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({
            status: res.statusCode,
            success: res.statusCode === 201 || res.statusCode === 200,
            data: json,
            error: res.statusCode >= 400 ? json.message || data : null
          });
        } catch {
          resolve({
            status: res.statusCode,
            success: false,
            error: data
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        status: 0,
        success: false,
        error: error.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        status: 0,
        success: false,
        error: 'Timeout'
      });
    });

    req.write(postData);
    req.end();
  });
}

async function test() {
  console.log('=== Тест логина с созданными пользователями ===\n');
  console.log('⏳ Ожидание запуска backend (10 секунд)...\n');
  
  await new Promise(resolve => setTimeout(resolve, 10000));

  console.log('📡 Тестирование логина...\n');

  // Тест 1: Администратор
  console.log('1. Тест логина администратора:');
  const adminResult = await testLogin('admin@masterprofi.com', 'admin123');
  if (adminResult.success) {
    console.log(`   ✓ Успешный вход! Токен получен.`);
    console.log(`   ✓ Role: ${adminResult.data.user?.role || 'unknown'}`);
  } else {
    console.log(`   ✗ Ошибка: ${adminResult.status} - ${adminResult.error || 'Unknown'}`);
  }

  console.log('\n2. Тест логина клиента:');
  const clientResult = await testLogin('www.pascha.ru542@gmail.com', 'test123');
  if (clientResult.success) {
    console.log(`   ✓ Успешный вход! Токен получен.`);
    console.log(`   ✓ Role: ${clientResult.data.user?.role || 'unknown'}`);
  } else {
    console.log(`   ✗ Ошибка: ${clientResult.status} - ${clientResult.error || 'Unknown'}`);
  }

  console.log('\n3. Тест неверного пароля:');
  const wrongPasswordResult = await testLogin('admin@masterprofi.com', 'wrongpassword');
  if (wrongPasswordResult.status === 401) {
    console.log(`   ✓ Корректная обработка неверного пароля (401)`);
  } else {
    console.log(`   ⚠ Неожиданный статус: ${wrongPasswordResult.status}`);
  }

  console.log('\n✅ Тестирование завершено!');
}

test();

