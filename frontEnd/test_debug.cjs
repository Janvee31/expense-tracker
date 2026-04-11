const axios = require('axios');
async function runTest() {
    try {
        console.log("Logging in...");
        const loginRes = await axios.post('http://localhost:8080/auth/login', {
            email: 'debug@test.com',
            password: 'password123'
        });
        const token = loginRes.data;
        console.log("Token:", token.substring(0, 20) + "...");

        console.log("Adding expense...");
        const addRes = await axios.post('http://localhost:8080/expenses', {
            category: 'Food',
            amount: 15.5,
            date: '2026-04-11'
        }, {
            headers: { Authorization: "Bearer " + token }
        });
        console.log('Add expense success:', addRes.data);
    } catch(err) {
        console.log("ERROR STATUS:", err.response?.status);
        console.log("ERROR DATA:", err.response?.data);
        console.log("ERROR MESSAGE:", err.message);
    }
}
runTest();
