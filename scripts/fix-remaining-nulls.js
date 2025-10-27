/**
 * Script to fix remaining null check issues
 */

const fs = require('fs')
const path = require('path')

const filesToFix = [
  'app/api/balance/route.ts',
  'app/api/categories/route.ts', 
  'app/api/transactions/route.ts'
]

filesToFix.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath)
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8')
    
    // Add null check after user creation pattern
    if (!content.includes('if (!user)') && content.includes('user = await findUserByClerkId(clerkUserId)')) {
      const insertionPattern = /user = await findUserByClerkId\(clerkUserId\)\s*}\s*\n/g
      content = content.replace(insertionPattern, `user = await findUserByClerkId(clerkUserId)
    }

    if (!user) {
      console.log('❌ Failed to create/find user')
      return NextResponse.json({ error: 'Failed to initialize user data' }, { status: 500 })
    }

`)
    }
    
    fs.writeFileSync(fullPath, content, 'utf8')
    console.log(`✅ Fixed ${filePath}`)
  }
})

console.log('✅ All null checks fixed!')