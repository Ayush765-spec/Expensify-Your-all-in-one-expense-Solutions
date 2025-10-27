// Test script to verify API behavior
// Run with: node test-api.js

const fetch = require('node-fetch');

async function testAPI() {
  const baseURL = 'http://localhost:3000';
  
  console.log('🧪 Testing Expensify API endpoints...\n');
  
  try {
    // Test if server is running
    console.log('1. Testing server health...');
    const healthResponse = await fetch(`${baseURL}/api/transactions`);
    console.log(`   Status: ${healthResponse.status}`);
    
    if (healthResponse.status === 401) {
      console.log('   ❌ Authentication required - this is expected');
    } else if (healthResponse.status === 200) {
      console.log('   ✅ Server is running and API is accessible');
    } else {
      console.log(`   ❓ Unexpected status: ${healthResponse.status}`);
    }
    
    // Test add-transaction endpoint
    console.log('\n2. Testing add-transaction endpoint...');
    const addResponse = await fetch(`${baseURL}/api/add-transaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        date: '2024-10-25',
        account: 'Checking',
        category: 'Food',
        type: 'Expense',
        amount: 50,
        status: 'Cleared',
        notes: 'Test transaction'
      })
    });
    
    console.log(`   Status: ${addResponse.status}`);
    
    if (addResponse.status === 401) {
      console.log('   ❌ Authentication required - this is expected');
    } else if (addResponse.status === 503) {
      console.log('   ❌ Database mode disabled or connection failed');
    } else {
      const result = await addResponse.json();
      console.log('   Response:', JSON.stringify(result, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAPI();