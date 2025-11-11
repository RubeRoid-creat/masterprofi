/**
 * Тест логина после исправления invited_by_id
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
  console.log('=== Тест логина после исправления invited_by_id ===\n');
  console.log('⏳ Ожидание запуска backend (10 секунд)...\n');
  
  await new Promise(resolve => setTimeout(resolve, 10000));

  console.log('📡 Тестирование логина...\n');

  // Тест с неверными данными (должен вернуть 401, но не 500)
  const result = await testLogin('test@example.com', 'wrongpassword');
  
  const icon = result.success ? '✓' : result.status === 401 ? '✓' : '✗';
  console.log(`${icon} POST /api/auth/login: ${result.status}`);
  
  if (result.status === 500) {
    console.log(`   ❌ Ошибка сервера: ${result.error || 'Unknown error'}`);
    console.log('\n⚠ Проблема с invited_by_id не решена!');
  } else if (result.status === 401) {
    console.log('   ✓ Ошибка авторизации (ожидаемо для неверных данных)');
    console.log('\n✅ Проблема с invited_by_id решена! Сервер обрабатывает запрос корректно.');
  } else if (result.success) {
    console.log('   ✓ Логин успешен!');
    console.log('\n✅ Проблема с invited_by_id решена!');
  } else {
    console.log(`   ⚠ Статус: ${result.status}, Ошибка: ${result.error || 'Unknown'}`);
  }
}

test();

