/**
 * Debug script to test the hook behavior
 * This simulates the exact data structure that useExpenseDataDB.addTransaction sends
 */

async function testHookBehavior() {
  console.log('🔍 Testing useExpenseDataDB addTransaction behavior...\n');

  // This simulates the exact transaction data structure from the Transaction interface
  const transactionData = {
    type: 'Expense',  // matches Transaction interface
    amount: 25.50,
    category: 'Food',
    account: 'Primary Savings',
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
    description: 'Test expense from hook',
    status: 'Cleared'
  };

  console.log('📋 Transaction Data (from hook):');
  console.log(JSON.stringify(transactionData, null, 2));

  // This simulates what the hook sends to the API
  const apiPayload = {
    type: transactionData.type, // Send as-is (Income/Expense)
    amount: transactionData.amount,
    category: transactionData.category,
    account: transactionData.account,
    date: new Date(transactionData.date).toISOString(),
    description: transactionData.description,
    status: transactionData.status || 'Cleared', // Add required status field
  };

  console.log('\n📤 API Payload (what hook sends):');
  console.log(JSON.stringify(apiPayload, null, 2));

  try {
    const response = await fetch('http://localhost:3000/api/add-transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiPayload)
    });

    const result = await response.json();

    console.log(`\n📊 Response Status: ${response.status}`);
    console.log('📊 Response Body:');
    console.log(JSON.stringify(result, null, 2));

    // Check if the error changed
    if (response.status === 401) {
      console.log('\n✅ SUCCESS: API is properly structured (401 = auth required, which is expected)');
      console.log('   The hook should now work correctly when user is authenticated.');
      return true;
    } else if (response.status === 400) {
      console.log('\n⚠️  VALIDATION ERROR: API rejected the data structure');
      console.log('   This means there might still be an issue with the payload.');
      return false;
    } else {
      console.log('\n🤔 UNEXPECTED: Different response than expected');
      return false;
    }

  } catch (error) {
    console.error('\n💥 NETWORK ERROR:', error.message);
    return false;
  }
}

// Run the test
testHookBehavior().then(success => {
  if (success) {
    console.log('\n🎉 Hook behavior test completed successfully!');
    console.log('   The addTransaction error should now be resolved.');
  } else {
    console.log('\n⚠️  Hook behavior test failed.');
  }
}).catch(error => {
  console.error('Unhandled error:', error);
});