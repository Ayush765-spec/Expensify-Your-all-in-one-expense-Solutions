const fetch = require('node-fetch');

async function debugCurrentIssue() {
    console.log('=== Debugging Current Dashboard Issue ===\n');
    
    try {
        // Test 1: Check if the home page is accessible
        console.log('1. Testing home page accessibility...');
        const homeResponse = await fetch('http://localhost:3000/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        
        console.log(`   Status: ${homeResponse.status} ${homeResponse.statusText}`);
        if (homeResponse.status === 200) {
            const homeContent = await homeResponse.text();
            console.log('   ✅ Home page accessible');
            
            // Check for Clerk redirects in the response
            if (homeContent.includes('clerk.accounts.dev')) {
                console.log('   ⚠️  Found Clerk redirect in response');
            }
            
            // Check for dashboard content
            if (homeContent.includes('dashboard') || homeContent.includes('Dashboard')) {
                console.log('   ✅ Dashboard references found in HTML');
            }
        }
        
        console.log();
        
        // Test 2: Test direct API calls
        console.log('2. Testing API endpoints directly...');
        const endpoints = [
            '/api/transactions',
            '/api/accounts', 
            '/api/categories'
        ];
        
        for (const endpoint of endpoints) {
            try {
                const response = await fetch(`http://localhost:3000${endpoint}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });
                
                const data = await response.json();
                console.log(`   ${endpoint}: ${response.status} - ${data.error || 'Success'}`);
            } catch (error) {
                console.log(`   ${endpoint}: Error - ${error.message}`);
            }
        }
        
        console.log();
        
        // Test 3: Test add transaction endpoint
        console.log('3. Testing add transaction endpoint...');
        try {
            const addResponse = await fetch('http://localhost:3000/api/add-transaction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                body: JSON.stringify({
                    date: new Date().toISOString().split('T')[0],
                    account: 'Cash',
                    category: 'Food',
                    type: 'Expense',
                    amount: 25.00,
                    status: 'Cleared',
                    description: 'Test transaction'
                })
            });
            
            const addData = await addResponse.json();
            console.log(`   POST /api/add-transaction: ${addResponse.status} - ${addData.error || 'Success'}`);
            if (addData.error) {
                console.log(`   Error details: ${addData.error}`);
            }
        } catch (error) {
            console.log(`   POST /api/add-transaction: Error - ${error.message}`);
        }
        
        console.log('\n=== Issue Analysis ===');
        console.log('Based on the tests above:');
        console.log('- If home page returns 200 but dashboard is empty → Frontend/auth issue');
        console.log('- If API calls return 401 → Authentication not working');
        console.log('- If add transaction fails → Backend validation or auth issue');
        console.log('- Check browser console for client-side errors');
        
    } catch (error) {
        console.error('❌ Debug script error:', error);
    }
}

debugCurrentIssue();