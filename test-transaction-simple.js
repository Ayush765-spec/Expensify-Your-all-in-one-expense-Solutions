// Simple test to verify transaction creation in database
require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testTransactionCreation() {
  try {
    console.log('🧪 Testing transaction creation directly in database...')
    
    // Find the existing user
    const user = await prisma.user.findFirst({
      include: {
        accounts: true,
        categories: true
      }
    })
    
    if (!user) {
      console.error('❌ No user found')
      return
    }
    
    console.log(`👤 Found user: ${user.email} (${user.id})`)
    console.log(`📦 Accounts: ${user.accounts.length}`)
    console.log(`🏷️ Categories: ${user.categories.length}`)
    
    // Get first account and category
    const account = user.accounts[0]
    const category = user.categories.find(c => c.name === 'Food') || user.categories[0]
    
    console.log(`💰 Using account: ${account.name} (${account.id})`)
    console.log(`🏷️ Using category: ${category.name} (${category.id})`)
    
    // Create transaction directly using Prisma
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        accountId: account.id,
        categoryId: category.id,
        amount: 75.25,
        type: 'EXPENSE',
        date: new Date(),
        description: 'Direct test transaction',
        notes: 'Testing database insert',
        status: 'CLEARED'
      },
      include: {
        account: true,
        category: true
      }
    })
    
    console.log('✅ Transaction created successfully!')
    console.log('💳 Transaction details:', {
      id: transaction.id,
      amount: transaction.amount,
      type: transaction.type,
      account: transaction.account.name,
      category: transaction.category.name,
      date: transaction.date.toISOString(),
      status: transaction.status
    })
    
    // Count total transactions
    const totalTransactions = await prisma.transaction.count({
      where: { userId: user.id }
    })
    
    console.log(`🎯 Total transactions for user: ${totalTransactions}`)
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    console.error('Error details:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testTransactionCreation()