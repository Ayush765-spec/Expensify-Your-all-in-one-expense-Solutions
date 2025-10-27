// Test the fixed add-transaction endpoint
import fetch from 'node-fetch';

async function testAddTransaction() {
    console.log('🧪 Testing Add Transaction API...\n');
    
    try {
        console.log('1️⃣ Testing add transaction endpoint...');
        const response = await fetch('http://localhost:3000/api/add-transaction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Test Client'
            },
            body: JSON.stringify({
                date: new Date().toISOString().split('T')[0],
                account: 'Cash', // This should match default account name
                category: 'Food', // This should match default category name
                type: 'Expense',
                amount: 25.00,
                status: 'Cleared',
                description: 'Test transaction',
                notes: 'API test'
            })
        });
        
        const data = await response.json();
        console.log(`Status: ${response.status}`);
        console.log('Response:', JSON.stringify(data, null, 2));
        
        if (response.status === 401) {
            console.log('❌ Authentication required - this is expected without Clerk session');
        } else if (response.status === 200) {
            console.log('✅ Transaction API working correctly');
        } else {
            console.log(`⚠️ Unexpected status: ${response.status}`);
        }
        
    } catch (error) {
        console.error('❌ Test error:', error);
    }
}

testAddTransaction();