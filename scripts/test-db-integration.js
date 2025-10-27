/**
 * Test script to verify database integration
 * Run with: node scripts/test-db-integration.js
 */

require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testDbIntegration() {
  console.log('🧪 Testing database integration...')

  try {
    // Test 1: Database connection
    console.log('\n1️⃣ Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connected successfully')

    // Test 2: Create test user
    console.log('\n2️⃣ Creating test user...')
    const testUser = await prisma.user.upsert({
      where: { clerkId: 'test_user_123' },
      update: {},
      create: {
        clerkId: 'test_user_123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User'
      }
    })
    console.log('✅ Test user created:', testUser.id)

    // Test 3: Create default categories and accounts
    console.log('\n3️⃣ Creating default data...')
    
    const category = await prisma.category.upsert({
      where: { 
        userId_name: {
          userId: testUser.id,
          name: 'Food'
        }
      },
      update: {},
      create: {
        userId: testUser.id,
        name: 'Food',
        icon: '🍽️',
        color: '#f59e0b'
      }
    })

    const account = await prisma.account.upsert({
      where: {
        userId_name: {
          userId: testUser.id,
          name: 'Test Account'
        }
      },
      update: {},
      create: {
        userId: testUser.id,
        name: 'Test Account',
        type: 'checking',
        balance: 1000
      }
    })
    console.log('✅ Default category and account created')

    // Test 4: Create transaction
    console.log('\n4️⃣ Creating test transaction...')
    const transaction = await prisma.transaction.create({
      data: {
        userId: testUser.id,
        accountId: account.id,
        categoryId: category.id,
        amount: 25.50,
        type: 'EXPENSE',
        date: new Date(),
        description: 'Test purchase',
        status: 'CLEARED'
      },
      include: {
        account: true,
        category: true
      }
    })
    console.log('✅ Transaction created:', transaction.id)

    // Test 5: Update account balance
    console.log('\n5️⃣ Testing balance update...')
    const updatedAccount = await prisma.account.update({
      where: { id: account.id },
      data: { 
        balance: account.balance - transaction.amount 
      }
    })
    console.log('✅ Account balance updated:', updatedAccount.balance)

    // Test 6: Query user data
    console.log('\n6️⃣ Testing data retrieval...')
    const userWithData = await prisma.user.findUnique({
      where: { id: testUser.id },
      include: {
        accounts: true,
        categories: true,
        transactions: {
          include: {
            account: true,
            category: true
          },
          orderBy: { date: 'desc' },
          take: 5
        }
      }
    })
    
    console.log('✅ User data retrieved:')
    console.log(`   - Accounts: ${userWithData.accounts.length}`)
    console.log(`   - Categories: ${userWithData.categories.length}`)
    console.log(`   - Transactions: ${userWithData.transactions.length}`)

    // Test 7: Calculate balance
    console.log('\n7️⃣ Testing balance calculation...')
    const accountBalance = await prisma.transaction.aggregate({
      where: {
        accountId: account.id,
        status: 'CLEARED'
      },
      _sum: {
        amount: true
      }
    })
    
    const calculatedBalance = account.balance - (accountBalance._sum.amount || 0)
    console.log('✅ Balance calculation completed:', calculatedBalance)

    // Cleanup
    console.log('\n🧹 Cleaning up test data...')
    await prisma.transaction.deleteMany({
      where: { userId: testUser.id }
    })
    await prisma.account.deleteMany({
      where: { userId: testUser.id }
    })
    await prisma.category.deleteMany({
      where: { userId: testUser.id }
    })
    await prisma.user.delete({
      where: { id: testUser.id }
    })
    console.log('✅ Test data cleaned up')

    console.log('\n🎉 All database integration tests passed!')

  } catch (error) {
    console.error('❌ Database integration test failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  testDbIntegration()
    .then(() => {
      console.log('\n✅ Test completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Test failed:', error)
      process.exit(1)
    })
}

module.exports = { testDbIntegration }