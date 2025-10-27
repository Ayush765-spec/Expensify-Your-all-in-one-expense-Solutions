// Test adding a transaction directly through API simulation
require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')
const { createTransaction } = require('./lib/db/transactions.ts')
const { findUserByClerkId } = require('./lib/db/user.ts')

const prisma = new PrismaClient()

async function testAddTransaction() {
  try {
    console.log('🧪 Testing add transaction directly...')
    
    // Find the existing user
    const user = await findUserByClerkId('user_34W2DmU6eKHCUYJYjUI96RDUBQM')
    console.log('👤 User found:', user.email)
    console.log('📦 Available accounts:', user.accounts.map(a => `${a.name} (${a.id})`))
    console.log('🏷️ Available categories:', user.categories.map(c => `${c.name} (${c.id})`))
    
    // Find a suitable account and category
    const checkingAccount = user.accounts.find(a => a.name === 'Checking Account')
    const foodCategory = user.categories.find(c => c.name === 'Food')
    
    if (!checkingAccount || !foodCategory) {
      console.error('❌ Required account or category not found')
      return
    }
    
    console.log(`💰 Using account: ${checkingAccount.name} (${checkingAccount.id})`)
    console.log(`🏷️ Using category: ${foodCategory.name} (${foodCategory.id})`)
    
    // Create a test transaction
    const transactionData = {
      userId: user.id,
      accountId: checkingAccount.id,
      categoryId: foodCategory.id,
      amount: 150.50,
      type: 'EXPENSE',
      date: new Date(),
      description: 'Test restaurant expense',
      notes: 'Testing transaction creation',
      status: 'CLEARED'
    }
    
    console.log('📝 Creating transaction:', transactionData)
    
    const transaction = await createTransaction(transactionData)
    console.log('✅ Transaction created successfully!')
    console.log('💳 Transaction details:', {
      id: transaction.id,
      amount: transaction.amount,
      type: transaction.type,
      account: transaction.account.name,
      category: transaction.category.name,
      date: transaction.date.toISOString()
    })
    
    // Verify the transaction was saved
    const allTransactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      include: {
        account: true,
        category: true
      }
    })
    
    console.log(`🎯 Total transactions for user: ${allTransactions.length}`)
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAddTransaction()