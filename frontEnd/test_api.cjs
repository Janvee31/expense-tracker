const axios = require('axios');
async function test() {
    try {
        const loginRes = await axios.post('http://localhost:8080/auth/login', {
            email: 'admin@google.com',
            password: 'password'
        });
        const token = loginRes.data.token;
        console.log('Login success');
        
        const addRes = await axios.post('http://localhost:8080/expenses', {
            category: 'Food',
            amount: 15.5,
            date: '2026-04-10'
        }, {
            headers: { Authorization: Bearer  }
        });
        console.log('Add expense success:', addRes.data);
    } catch(err) {
        console.error('Error:', err.response ? err.response.data : err.message);
    }
}
test();
