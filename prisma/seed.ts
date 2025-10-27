import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create a sample user for testing (you can remove this when integrating with Clerk)
  const testUser = await prisma.user.upsert({
    where: { clerkId: 'test_user_123' },
    update: {},
    create: {
      clerkId: 'test_user_123',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    },
  })

  console.log('✅ Created test user:', testUser.id)

  // Create default categories
  const categories = [
    { name: 'Salary', icon: '💰', color: '#22c55e' },
    { name: 'Freelance', icon: '💻', color: '#3b82f6' },
    { name: 'Investments', icon: '📈', color: '#8b5cf6' },
    { name: 'Food', icon: '🍽️', color: '#f59e0b' },
    { name: 'Groceries', icon: '🛒', color: '#10b981' },
    { name: 'Transport', icon: '🚗', color: '#ef4444' },
    { name: 'Entertainment', icon: '🎬', color: '#ec4899' },
    { name: 'Utilities', icon: '⚡', color: '#f97316' },
    { name: 'Healthcare', icon: '🏥', color: '#06b6d4' },
    { name: 'Shopping', icon: '🛍️', color: '#84cc16' },
    { name: 'Subscriptions', icon: '📱', color: '#6366f1' },
    { name: 'Travel', icon: '✈️', color: '#14b8a6' },
  ]

  const createdCategories = await Promise.all(
    categories.map(category =>
      prisma.category.upsert({
        where: { 
          userId_name: { 
            userId: testUser.id, 
            name: category.name 
          } 
        },
        update: {},
        create: {
          ...category,
          userId: testUser.id,
        },
      })
    )
  )

  console.log('✅ Created categories:', createdCategories.length)

  // Create default accounts
  const accounts = [
    { name: 'Primary Savings', type: 'savings', balance: 50000 },
    { name: 'Checking Account', type: 'checking', balance: 25000 },
    { name: 'Credit Card', type: 'credit', balance: -5000 },
  ]

  const createdAccounts = await Promise.all(
    accounts.map(account =>
      prisma.account.upsert({
        where: { 
          id: `${testUser.id}_${account.name.replace(' ', '_').toLowerCase()}` 
        },
        update: {},
        create: {
          id: `${testUser.id}_${account.name.replace(' ', '_').toLowerCase()}`,
          ...account,
          userId: testUser.id,
        },
      })
    )
  )

  console.log('✅ Created accounts:', createdAccounts.length)

  // Create sample transactions
  const transactions = [
    {
      date: new Date('2024-01-15'),
      amount: 185000,
      type: 'INCOME' as const,
      description: 'Monthly Salary',
      accountId: createdAccounts[0].id,
      categoryId: createdCategories.find(c => c.name === 'Salary')!.id,
    },
    {
      date: new Date('2024-01-10'),
      amount: 5000,
      type: 'EXPENSE' as const,
      description: 'Grocery Shopping',
      accountId: createdAccounts[1].id,
      categoryId: createdCategories.find(c => c.name === 'Groceries')!.id,
    },
    {
      date: new Date('2024-01-08'),
      amount: 2500,
      type: 'EXPENSE' as const,
      description: 'Fuel',
      accountId: createdAccounts[2].id,
      categoryId: createdCategories.find(c => c.name === 'Transport')!.id,
    },
    {
      date: new Date('2024-01-20'),
      amount: 1500,
      type: 'EXPENSE' as const,
      description: 'Movie night',
      accountId: createdAccounts[1].id,
      categoryId: createdCategories.find(c => c.name === 'Entertainment')!.id,
    },
    {
      date: new Date('2024-01-22'),
      amount: 30000,
      type: 'INCOME' as const,
      description: 'Freelance project',
      accountId: createdAccounts[0].id,
      categoryId: createdCategories.find(c => c.name === 'Freelance')!.id,
    },
    {
      date: new Date('2024-02-05'),
      amount: 1200,
      type: 'EXPENSE' as const,
      description: 'Electricity bill',
      accountId: createdAccounts[1].id,
      categoryId: createdCategories.find(c => c.name === 'Utilities')!.id,
    },
    {
      date: new Date('2024-02-15'),
      amount: 185000,
      type: 'INCOME' as const,
      description: 'Monthly Salary',
      accountId: createdAccounts[0].id,
      categoryId: createdCategories.find(c => c.name === 'Salary')!.id,
    },
    {
      date: new Date('2024-02-18'),
      amount: 800,
      type: 'EXPENSE' as const,
      description: 'Netflix subscription',
      accountId: createdAccounts[2].id,
      categoryId: createdCategories.find(c => c.name === 'Subscriptions')!.id,
    },
  ]

  const createdTransactions = await Promise.all(
    transactions.map(tx =>
      prisma.transaction.create({
        data: {
          ...tx,
          userId: testUser.id,
        },
      })
    )
  )

  console.log('✅ Created sample transactions:', createdTransactions.length)
  console.log('🎉 Database seeded successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed error:', e)
    await prisma.$disconnect()
    process.exit(1)
  })