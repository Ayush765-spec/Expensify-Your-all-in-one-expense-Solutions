/**
 * Debug authentication issue
 * Test API endpoints directly to see if authentication is working
 */

async function testAPI() {
  const baseUrl = 'http://localhost:3000'
  
  console.log('=== Testing API Authentication ===')
  
  try {
    // Test transactions endpoint
    console.log('Testing GET /api/transactions...')
    const transactionsResponse = await fetch(`${baseUrl}/api/transactions`)
    console.log('Transactions response status:', transactionsResponse.status)
    
    if (transactionsResponse.status === 401) {
      console.log('❌ Authentication required for transactions endpoint')
    } else if (transactionsResponse.ok) {
      const transactionsData = await transactionsResponse.json()
      console.log('✅ Transactions data:', transactionsData)
    } else {
      console.log('❌ Unexpected error:', transactionsResponse.statusText)
    }
    
    // Test accounts endpoint
    console.log('\nTesting GET /api/accounts...')
    const accountsResponse = await fetch(`${baseUrl}/api/accounts`)
    console.log('Accounts response status:', accountsResponse.status)
    
    if (accountsResponse.status === 401) {
      console.log('❌ Authentication required for accounts endpoint')
    } else if (accountsResponse.ok) {
      const accountsData = await accountsResponse.json()
      console.log('✅ Accounts data:', accountsData)
    } else {
      console.log('❌ Unexpected error:', accountsResponse.statusText)
    }
    
    // Test categories endpoint
    console.log('\nTesting GET /api/categories...')
    const categoriesResponse = await fetch(`${baseUrl}/api/categories`)
    console.log('Categories response status:', categoriesResponse.status)
    
    if (categoriesResponse.status === 401) {
      console.log('❌ Authentication required for categories endpoint')
    } else if (categoriesResponse.ok) {
      const categoriesData = await categoriesResponse.json()
      console.log('✅ Categories data:', categoriesData)
    } else {
      console.log('❌ Unexpected error:', categoriesResponse.statusText)
    }
    
  } catch (error) {
    console.error('❌ Fetch error:', error.message)
  }
}

// Run the test
testAPI()