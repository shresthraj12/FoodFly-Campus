const axios = require('axios');

async function testAuth() {
  try {
    console.log('Testing Registration...');
    const regRes = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'customer'
    });
    console.log('Registration Success:', regRes.data);
  } catch (err) {
    console.log('Registration Failed:', err.response ? err.response.data : err.message);
  }

  try {
    console.log('Testing Login...');
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('Login Success:', loginRes.data);
  } catch (err) {
    console.log('Login Failed:', err.response ? err.response.data : err.message);
  }
}

testAuth();
