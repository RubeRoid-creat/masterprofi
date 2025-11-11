/**
 * Тест API платежей
 */

const http = require('http');

function testPaymentsAPI(token) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/payments',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
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
            success: res.statusCode === 200,
            data: json,
            error: res.statusCode >= 400 ? (json.message || json.error || data) : null
          });
        } catch {
          resolve({
            status: res.statusCode,
            success: false,
            rawResponse: data.substring(0, 500)
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

    req.end();
  });
}

async function test() {
  console.log('=== Тест API платежей ===\n');

  // Сначала получаем токен
  console.log('1. Получение токена для авторизации...');
  const loginResult = await new Promise((resolve) => {
    const postData = JSON.stringify({
      email: 'admin@masterprofi.com',
      password: 'admin123'
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
      timeout: 10000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({
            status: res.statusCode,
            token: json.access_token || json.token
          });
        } catch {
          resolve({ status: res.statusCode, error: data });
        }
      });
    });

    req.on('error', () => resolve({ status: 0, error: 'Connection error' }));
    req.write(postData);
    req.end();
  });

  if (!loginResult.token) {
    console.log('❌ Не удалось получить токен');
    console.log(`   Статус: ${loginResult.status}`);
    console.log(`   Ошибка: ${loginResult.error || 'Unknown'}`);
    return;
  }

  console.log('✓ Токен получен\n');

  // Тестируем API платежей
  console.log('2. Тест GET /api/payments...');
  const paymentsResult = await testPaymentsAPI(loginResult.token);

  console.log(`   Статус: ${paymentsResult.status}`);
  
  if (paymentsResult.success) {
    console.log('✓ Платежи загружены успешно');
    
    if (Array.isArray(paymentsResult.data)) {
      console.log(`   Количество платежей: ${paymentsResult.data.length}`);
    } else {
      console.log('   ⚠ Ответ не является массивом');
      console.log('   Тип данных:', typeof paymentsResult.data);
    }
  } else {
    console.log('❌ Ошибка загрузки платежей');
    console.log(`   Ошибка: ${paymentsResult.error || paymentsResult.rawResponse || 'Unknown'}`);
  }
}

test();

