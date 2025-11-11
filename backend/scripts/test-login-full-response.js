/**
 * Тест логина с полным выводом ответа
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
            fullResponse: json,
            hasAccessToken: !!json.accessToken,
            hasRefreshToken: !!json.refreshToken,
            hasUser: !!json.user
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

    req.write(postData);
    req.end();
  });
}

async function test() {
  console.log('=== Тест логина с полным ответом ===\n');

  const result = await testLogin('www.pascha.ru542@gmail.com', 'test123');
  
  console.log(`Статус: ${result.status}`);
  console.log(`Успешно: ${result.success ? 'Да' : 'Нет'}`);
  console.log(`Access Token: ${result.hasAccessToken ? '✓ Есть' : '✗ Нет'}`);
  console.log(`Refresh Token: ${result.hasRefreshToken ? '✓ Есть' : '✗ Нет'}`);
  console.log(`User: ${result.hasUser ? '✓ Есть' : '✗ Нет'}`);
  
  if (result.fullResponse) {
    console.log('\n📋 Полный ответ:');
    console.log(JSON.stringify(result.fullResponse, null, 2));
  } else if (result.rawResponse) {
    console.log('\n📋 Сырой ответ:');
    console.log(result.rawResponse);
  } else if (result.error) {
    console.log(`\n❌ Ошибка: ${result.error}`);
  }
}

test();

