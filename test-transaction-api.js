// Using built-in fetch for Node.js 18+

async function testTransactionAPI() {
  console.log('🧪 Testing Transaction API...\n');
  
  try {
    // Test GET transactions endpoint
    console.log('1️⃣ Testing GET /api/transactions...');
    const getResponse = await fetch('http://localhost:3000/api/transactions', {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (getResponse.ok) {
      const data = await getResponse.json();
      console.log('✅ GET /api/transactions successful');
      console.log('   Transactions count:', data.transactions?.length || 0);
      
      // Show first few transactions for verification
      if (data.transactions && data.transactions.length > 0) {
        console.log('   Latest transactions:');
        data.transactions.slice(0, 3).forEach((tx, i) => {
          console.log(`     ${i + 1}. ${tx.date} | ${tx.type} | $${tx.amount} | ${tx.account} | ${tx.category}`);
        });
      }
    } else {
      const errorText = await getResponse.text();
      console.log('❌ GET /api/transactions failed:', getResponse.status);
      console.log('   Error:', errorText);
    }
    
    // Test summary endpoint
    console.log('\n2️⃣ Testing GET /api/transactions?summary=true...');
    const summaryResponse = await fetch('http://localhost:3000/api/transactions?summary=true', {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (summaryResponse.ok) {
      const summaryData = await summaryResponse.json();
      console.log('✅ GET /api/transactions?summary=true successful');
      console.log('   Total Income:', summaryData.totalIncome || 0);
      console.log('   Total Expenses:', summaryData.totalExpenses || 0);
      console.log('   Net Balance:', summaryData.netBalance || 0);
    } else {
      const errorText = await summaryResponse.text();
      console.log('❌ Summary endpoint failed:', summaryResponse.status);
      console.log('   Error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    // Check if server is running
    try {
      const healthCheck = await fetch('http://localhost:3000/api/health');
      if (!healthCheck.ok) {
        console.log('❌ Server appears to be down or not responding');
      }
    } catch (healthError) {
      console.log('❌ Cannot reach server at http://localhost:3000');
      console.log('   Make sure the development server is running with: npm run dev');
    }
  }
}

testTransactionAPI();