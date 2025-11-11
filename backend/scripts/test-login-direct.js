/**
 * Прямой тест логина через API
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
            success: res.statusCode === 201 || res.statusCode === 200,
            data: json,
            error: res.statusCode >= 400 ? (json.message || json.error || data) : null
          });
        } catch {
          resolve({
            status: res.statusCode,
            success: false,
            error: data.substring(0, 200)
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
  console.log('=== Тест логина через API ===\n');

  const testCases = [
    {
      name: 'Клиент (точный email)',
      email: 'www.pascha.ru542@gmail.com',
      password: 'test123'
    },
    {
      name: 'Клиент (email с пробелами)',
      email: ' www.pascha.ru542@gmail.com ',
      password: 'test123'
    },
    {
      name: 'Клиент (email в верхнем регистре)',
      email: 'WWW.PASCHA.RU542@GMAIL.COM',
      password: 'test123'
    },
    {
      name: 'Администратор',
      email: 'admin@masterprofi.com',
      password: 'admin123'
    },
    {
      name: 'Неверный пароль',
      email: 'www.pascha.ru542@gmail.com',
      password: 'wrongpassword'
    }
  ];

  for (const testCase of testCases) {
    console.log(`📋 ${testCase.name}:`);
    console.log(`   Email: "${testCase.email}"`);
    console.log(`   Password: "${testCase.password}"`);
    
    const result = await testLogin(testCase.email, testCase.password);
    
    if (result.success) {
      console.log(`   ✅ Успешный вход!`);
      console.log(`   Role: ${result.data.user?.role || 'unknown'}`);
      console.log(`   Access token: ${result.data.accessToken ? 'получен' : 'не получен'}`);
    } else {
      console.log(`   ❌ Ошибка: ${result.status}`);
      console.log(`   Сообщение: ${result.error || 'Unknown error'}`);
    }
    
    console.log('');
    
    // Небольшая задержка между запросами
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('✅ Тестирование завершено!');
}

test();

