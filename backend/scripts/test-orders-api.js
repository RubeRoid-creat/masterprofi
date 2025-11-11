/**
 * Тест API заказов
 */

const http = require('http');

function testOrdersAPI(token) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/orders',
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
  console.log('=== Тест API заказов ===\n');

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

  // Тестируем API заказов
  console.log('2. Тест GET /api/orders...');
  const ordersResult = await testOrdersAPI(loginResult.token);

  console.log(`   Статус: ${ordersResult.status}`);
  
  if (ordersResult.success) {
    console.log('✓ Заказы загружены успешно');
    
    if (Array.isArray(ordersResult.data)) {
      console.log(`   Количество заказов: ${ordersResult.data.length}`);
      
      if (ordersResult.data.length > 0) {
        console.log('\n   Первый заказ:');
        const firstOrder = ordersResult.data[0];
        console.log(`     ID: ${firstOrder.id}`);
        console.log(`     Status: ${firstOrder.status}`);
        console.log(`     Total: ${firstOrder.totalAmount || 0}`);
      } else {
        console.log('   ⚠ Таблица заказов пустая');
      }
    } else {
      console.log('   ⚠ Ответ не является массивом');
      console.log('   Тип данных:', typeof ordersResult.data);
    }
  } else {
    console.log('❌ Ошибка загрузки заказов');
    console.log(`   Ошибка: ${ordersResult.error || ordersResult.rawResponse || 'Unknown'}`);
  }

  // Проверяем без токена
  console.log('\n3. Тест без авторизации (должен вернуть 401)...');
  const unauthorizedResult = await testOrdersAPI('');
  console.log(`   Статус: ${unauthorizedResult.status}`);
  if (unauthorizedResult.status === 401) {
    console.log('✓ Корректно возвращает 401 без токена');
  } else {
    console.log('⚠ Неожиданный статус без токена');
  }
}

test();

