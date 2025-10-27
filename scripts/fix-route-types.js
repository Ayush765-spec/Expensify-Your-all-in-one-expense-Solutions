/**
 * Script to fix TypeScript type issues in all route files
 * Run with: node scripts/fix-route-types.js
 */

const fs = require('fs')
const path = require('path')

function fixRouteFile(filePath) {
  console.log(`Fixing ${filePath}...`)
  
  let content = fs.readFileSync(filePath, 'utf8')
  
  // Fix the user creation pattern
  const oldPattern = /user = await createUser\(clerkUserId, '[^']*'\)\s*await initializeUserData\(user\.id\)/g
  const newPattern = `const newUser = await createUser(clerkUserId, 'user@example.com')
      await initializeUserData(newUser.id)
      // Fetch the complete user with accounts and categories
      user = await findUserByClerkId(clerkUserId)`
  
  content = content.replace(oldPattern, newPattern)
  
  // Add null check after user creation/finding
  if (!content.includes('if (!user)') && content.includes('let user = await findUserByClerkId')) {
    const insertPoint = content.indexOf('const body: AddTransactionRequest = await req.json()') || 
                       content.indexOf('const transactions = await getUserTransactions') ||
                       content.indexOf('const categories = await prisma.category.findMany') ||
                       content.indexOf('const accounts = await prisma.account.findMany') ||
                       content.indexOf('const balanceData = await getUserBalance')
    
    if (insertPoint > 0) {
      const beforeInsert = content.substring(0, insertPoint)
      const afterInsert = content.substring(insertPoint)
      
      const nullCheck = `
    if (!user) {
      console.log('❌ Failed to create/find user')
      return NextResponse.json({ error: 'Failed to initialize user data' }, { status: 500 })
    }

    `
      
      content = beforeInsert + nullCheck + afterInsert
    }
  }
  
  fs.writeFileSync(filePath, content, 'utf8')
  console.log(`✅ Fixed ${filePath}`)
}

// List of route files to fix
const routeFiles = [
  'app/api/accounts/route.ts',
  'app/api/balance/route.ts', 
  'app/api/categories/route.ts',
  'app/api/transactions/route.ts'
]

console.log('🔧 Fixing TypeScript issues in route files...')

routeFiles.forEach(file => {
  const fullPath = path.join(process.cwd(), file)
  if (fs.existsSync(fullPath)) {
    fixRouteFile(fullPath)
  } else {
    console.log(`⚠️ File not found: ${fullPath}`)
  }
})

console.log('✅ All route files fixed!')