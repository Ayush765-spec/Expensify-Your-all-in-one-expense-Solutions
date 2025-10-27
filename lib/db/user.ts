import { prisma } from '@/lib/prisma'

export async function createUser(clerkId: string, email: string, firstName?: string, lastName?: string) {
  return await prisma.user.create({
    data: {
      clerkId,
      email,
      firstName,
      lastName,
    }
  })
}

export async function findUserByClerkId(clerkId: string) {
  return await prisma.user.findUnique({
    where: {
      clerkId
    },
    include: {
      accounts: true,
      categories: true
    }
  })
}

export async function initializeUserData(userId: string) {
  // Create default categories
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

  const categories = await Promise.all(
    defaultCategories.map(category =>
      prisma.category.create({
        data: {
          ...category,
          userId
        }
      })
    )
  )

  // Create default accounts
  const defaultAccounts = [
    { name: 'Primary Savings', type: 'savings', balance: 0 },
    { name: 'Checking Account', type: 'checking', balance: 0 },
    { name: 'Credit Card', type: 'credit', balance: 0 },
  ]

  const accounts = await Promise.all(
    defaultAccounts.map(account =>
      prisma.account.create({
        data: {
          ...account,
          userId
        }
      })
    )
  )

  return { categories, accounts }
}