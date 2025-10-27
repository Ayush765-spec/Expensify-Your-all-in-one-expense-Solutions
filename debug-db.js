// Debug script to check database connectivity and data
require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function debugDatabase() {
  try {
    console.log('🔍 Testing database connection...')
    
    // Test connection
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Check users
    const users = await prisma.user.findMany({
      include: {
        accounts: true,
        categories: true,
        transactions: {
          take: 5,
          orderBy: { date: 'desc' },
          include: {
            account: true,
            category: true
          }
        }
      }
    })
    
    console.log(`📊 Found ${users.length} users in database`)
    
    users.forEach((user, index) => {
      console.log(`\n👤 User ${index + 1}:`)
      console.log(`   Clerk ID: ${user.clerkId}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Accounts: ${user.accounts.length}`)
      console.log(`   Categories: ${user.categories.length}`)
      console.log(`   Transactions: ${user.transactions.length}`)
      
      if (user.transactions.length > 0) {
        console.log('   Recent transactions:')
        user.transactions.forEach((tx, txIndex) => {
          console.log(`     ${txIndex + 1}. ${tx.type} ${tx.amount} - ${tx.account.name} (${tx.category.name}) - ${tx.date.toISOString().split('T')[0]}`)
        })
      }
    })
    
    // Check total transactions
    const totalTransactions = await prisma.transaction.count()
    console.log(`\n📈 Total transactions in database: ${totalTransactions}`)
    
    if (totalTransactions > 0) {
      const recentTransactions = await prisma.transaction.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          account: true,
          category: true,
          user: {
            select: {
              clerkId: true,
              email: true
            }
          }
        }
      })
      
      console.log('\n📋 Most recent transactions:')
      recentTransactions.forEach((tx, index) => {
        console.log(`  ${index + 1}. ${tx.type} ₹${tx.amount} - ${tx.account.name} (${tx.category.name}) - ${tx.user.email} - ${tx.createdAt.toISOString()}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Database error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugDatabase()