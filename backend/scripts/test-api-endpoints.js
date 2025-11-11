/**
 * Проверка работы API endpoints после исправления ошибок
 */

const http = require('http');

function testEndpoint(path, token = null) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/api${path}`,
      method: 'GET',
      timeout: 5000,
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          path,
          status: res.statusCode,
          success: res.statusCode < 500,
          error: res.statusCode >= 500 ? data : null
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        path,
        status: 0,
        success: false,
        error: error.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        path,
        status: 0,
        success: false,
        error: 'Timeout'
      });
    });

    req.end();
  });
}

async function testAll() {
  console.log('=== Проверка API endpoints ===\n');
  console.log('⏳ Ожидание запуска backend (10 секунд)...\n');
  
  await new Promise(resolve => setTimeout(resolve, 10000));

  const endpoints = [
    { path: '/stats/dashboard', requiresAuth: true },
    { path: '/orders', requiresAuth: true },
    { path: '/payments', requiresAuth: true },
  ];

  console.log('📡 Проверка endpoints:\n');

  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint.path);
    const icon = result.success ? '✓' : '✗';
    const statusText = result.status === 401 ? '(требуется авторизация)' : 
                      result.status === 404 ? '(не найден)' :
                      result.status === 500 ? '(ошибка сервера)' : '';
    
    console.log(`${icon} ${endpoint.path}: ${result.status} ${statusText}`);
    
    if (result.error && result.status === 500) {
      console.log(`   Ошибка: ${result.error.substring(0, 100)}`);
    }
  }

  console.log('\n✅ Проверка завершена!');
  console.log('\n📝 Примечания:');
  console.log('  - 401 означает, что требуется авторизация (это нормально)');
  console.log('  - 404 означает, что endpoint не найден');
  console.log('  - 500 означает ошибку сервера (это нужно исправить)');
  console.log('  - 200 означает успешный ответ (требуется авторизация)');
}

testAll();

