require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function showTransactions() {
  try {
    await prisma.$connect()
    const transactions = await prisma.transaction.findMany({
      include: {
        account: true,
        category: true
      }
    })
    console.log(transactions)
  } catch (error) {
    console.error('Error fetching transactions:', error)
  } finally {
    await prisma.$disconnect()
  }
}

showTransactions()
