import { prisma } from '@/lib/prisma'

/**
 * Recalculate account balances based on all transactions
 * This can be used to fix balance inconsistencies
 */
export async function recalculateAccountBalances(userId: string) {
  const accounts = await prisma.account.findMany({
    where: { userId },
    include: {
      transactions: {
        where: { status: 'CLEARED' }
      }
    }
  })

  for (const account of accounts) {
    const balance = account.transactions.reduce((total, transaction) => {
      if (transaction.type === 'INCOME') {
        return total + transaction.amount
      } else {
        return total - transaction.amount
      }
    }, 0)

    await prisma.account.update({
      where: { id: account.id },
      data: { balance }
    })

    console.log(`Updated balance for ${account.name}: ${balance}`)
  }

  return accounts.length
}

/**
 * Initialize user with default data if they don't have any
 */
export async function ensureUserHasDefaultData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      accounts: true,
      categories: true
    }
  })

  if (!user) {
    throw new Error('User not found')
  }

  let needsCategories = user.categories.length === 0
  let needsAccounts = user.accounts.length === 0

  if (needsCategories) {
    const defaultCategories = [
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

    await Promise.all(
      defaultCategories.map(category =>
        prisma.category.create({
          data: {
            ...category,
            userId
          }
        })
      )
    )
  }

  if (needsAccounts) {
    const defaultAccounts = [
      { name: 'Primary Savings', type: 'savings', balance: 0 },
      { name: 'Checking Account', type: 'checking', balance: 0 },
      { name: 'Credit Card', type: 'credit', balance: 0 },
    ]

    await Promise.all(
      defaultAccounts.map(account =>
        prisma.account.create({
          data: {
            ...account,
            userId
          }
        })
      )
    )
  }

  return { createdCategories: needsCategories, createdAccounts: needsAccounts }
}