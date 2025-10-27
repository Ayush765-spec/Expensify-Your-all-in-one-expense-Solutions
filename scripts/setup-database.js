/**
 * Database setup script
 * Run with: node scripts/setup-database.js
 */

require('dotenv').config({ path: '.env.local' })
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

function runCommand(command, description) {
  console.log(`\n📋 ${description}...`)
  try {
    execSync(command, { stdio: 'inherit', cwd: process.cwd() })
    console.log(`✅ ${description} completed`)
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message)
    throw error
  }
}

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${description} exists`)
    return true
  } else {
    console.log(`❌ ${description} missing: ${filePath}`)
    return false
  }
}

async function setupDatabase() {
  console.log('🚀 Setting up Expensify database with Neon + Prisma...')

  // Check required files
  console.log('\n🔍 Checking required files...')
  const requiredFiles = [
    ['prisma/schema.prisma', 'Prisma schema'],
    ['lib/prisma.ts', 'Prisma client'],
    ['lib/db/user.ts', 'User database functions'],
    ['lib/db/transactions.ts', 'Transaction database functions'],
    ['lib/db/balance.ts', 'Balance database functions'],
    ['.env.local', 'Environment variables']
  ]

  let allFilesExist = true
  for (const [filePath, description] of requiredFiles) {
    if (!checkFile(path.join(process.cwd(), filePath), description)) {
      allFilesExist = false
    }
  }

  if (!allFilesExist) {
    console.error('\n❌ Some required files are missing. Please ensure all database files are created.')
    process.exit(1)
  }

  // Check environment variables
  console.log('\n🔍 Checking environment variables...')
  require('dotenv').config({ path: '.env.local' })
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in .env.local')
    console.log('Please add your Neon database URL to .env.local:')
    console.log('DATABASE_URL="postgresql://username:password@your-neon-hostname/dbname?sslmode=require"')
    process.exit(1)
  }
  console.log('✅ Database URL configured')

  try {
    // Generate Prisma client
    runCommand('npx prisma generate', 'Generating Prisma client')

    // Push schema to database
    runCommand('npx prisma db push', 'Pushing database schema')

    // Test database connection
    console.log('\n🧪 Testing database connection...')
    const { testDbIntegration } = require('./test-db-integration.js')
    await testDbIntegration()

    // Seed database (optional)
    console.log('\n🌱 Seeding database with sample data...')
    try {
      runCommand('npx prisma db seed', 'Seeding database')
    } catch (error) {
      console.log('ℹ️ No seed script found or seeding failed - this is optional')
    }

    console.log(`
🎉 Database setup completed successfully!

📚 Next steps:
1. Start your development server: npm run dev
2. Test the receipt scanning with auto-save feature
3. Create transactions through the UI
4. Monitor balance updates automatically

🔗 Useful commands:
- View database: npx prisma studio
- Reset database: npx prisma db push --force-reset
- Generate client: npx prisma generate
- Check migrations: npx prisma migrate status

✨ Your Expensify app is now connected to persistent storage!
    `)

  } catch (error) {
    console.error('\n❌ Database setup failed:', error)
    console.log('\n🔧 Troubleshooting tips:')
    console.log('1. Verify your DATABASE_URL is correct')
    console.log('2. Check your Neon database is accessible')
    console.log('3. Ensure all required environment variables are set')
    console.log('4. Try running: npx prisma db push --force-reset')
    process.exit(1)
  }
}

if (require.main === module) {
  setupDatabase()
    .then(() => {
      process.exit(0)
    })
    .catch((error) => {
      console.error('Setup failed:', error)
      process.exit(1)
    })
}

module.exports = { setupDatabase }