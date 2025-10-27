/**
 * Test authentication flow - simulate what happens in the browser
 */

console.log('=== Testing Authentication Flow ===')

// Simulate the flow that should happen:
// 1. User visits /
// 2. Redirected to /sign-in (if not authenticated) or /dashboard (if authenticated)
// 3. After sign-in, user goes to /dashboard
// 4. Dashboard components load and try to fetch data via useExpenseDataDB hook
// 5. Hook makes API calls to /api/transactions, /api/accounts, etc.

async function testFlow() {
  const baseUrl = 'http://localhost:3000'
  
  console.log('1. Testing home page redirect...')
  try {
    const homeResponse = await fetch(`${baseUrl}/`)
    console.log(`Home response: ${homeResponse.status} ${homeResponse.statusText}`)
    
    // Check if it redirects to sign-in
    if (homeResponse.redirected) {
      console.log(`Redirected to: ${homeResponse.url}`)
    }
  } catch (error) {
    console.error('Error testing home page:', error.message)
  }

  console.log('\n2. Testing API endpoints (without auth)...')
  
  const endpoints = [
    '/api/transactions',
    '/api/accounts', 
    '/api/categories',
    '/api/add-transaction'
  ]
  
  for (const endpoint of endpoints) {
    try {
      const method = endpoint.includes('add-transaction') ? 'POST' : 'GET'
      const body = endpoint.includes('add-transaction') ? JSON.stringify({
        date: '2024-01-15',
        account: 'Cash',
        category: 'Food',
        type: 'Expense',
        amount: 100,
        status: 'Cleared'
      }) : undefined
      
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body
      })
      
      console.log(`${method} ${endpoint}: ${response.status} ${response.statusText}`)
      
      if (response.status === 401) {
        console.log('  ↳ Expected: Authentication required')
      } else if (response.ok) {
        console.log('  ↳ Unexpected: Should require authentication')
      } else {
        console.log(`  ↳ Error: ${response.statusText}`)
      }
    } catch (error) {
      console.error(`Error testing ${endpoint}:`, error.message)
    }
  }

  console.log('\n3. Testing environment variables...')
  console.log('NEXT_PUBLIC_USE_DATABASE:', process.env.NEXT_PUBLIC_USE_DATABASE || 'not set')
  
  console.log('\n=== Summary ===')
  console.log('The authentication flow requires:')
  console.log('1. User must sign in through Clerk')
  console.log('2. Clerk session must be established')
  console.log('3. Session cookies must be sent with API requests')
  console.log('4. API routes use auth() from @clerk/nextjs/server to verify')
  console.log('\nIf existing values are not showing, user likely needs to:')
  console.log('- Sign out and sign back in')
  console.log('- Clear browser cookies/localStorage')
  console.log('- Ensure they have proper authentication')
}

testFlow()