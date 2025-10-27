// Test the frontend-to-API flow
require('dotenv').config({ path: '.env.local' })
const { default: fetch } = require('node-fetch')

async function simulateAPICall() {
  try {
    console.log('🧪 Testing frontend API call simulation...')
    
    // Test the add-transaction API with data similar to what the frontend sends
    const transactionData = {
      date: '2025-10-25',
      account: 'Credit Card', // Using account name (backward compatibility)
      category: 'Food',       // Using category name (backward compatibility)
      type: 'Expense',
      amount: 25.75,
      status: 'Cleared',
      notes: 'Test from API simulation'
    }
    
    console.log('📝 Sending transaction data:', transactionData)
    
    const response = await fetch('http://localhost:3000/api/add-transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: No authentication headers because we're not authenticated
      },
      body: JSON.stringify(transactionData)
    })
    
    console.log(`📊 Response status: ${response.status}`)
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ Success response:', result)
    } else {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      console.log('❌ Error response:', error)
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error.message)
  }
}

async function testGetTransactions() {
  try {
    console.log('\n🔍 Testing get transactions API...')
    
    const response = await fetch('http://localhost:3000/api/transactions', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    console.log(`📊 Response status: ${response.status}`)
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ Success response:', result)
    } else {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      console.log('❌ Error response:', error)
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error.message)
  }
}

// Run both tests
async function runTests() {
  await simulateAPICall()
  await testGetTransactions()
}

runTests()