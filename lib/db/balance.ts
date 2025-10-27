import { prisma } from '@/lib/prisma'

export async function getUserBalance(userId: string) {
  const accounts = await prisma.account.findMany({
    where: {
      userId,
      isActive: true
    }
  })

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)
  
  return {
    totalBalance,
    accounts: accounts.map(account => ({
      id: account.id,
      name: account.name,
      type: account.type,
      balance: account.balance,
      currency: account.currency
    }))
  }
}

export async function updateAccountBalance(accountId: string, amount: number, isIncome: boolean) {
  const account = await prisma.account.findUnique({
    where: { id: accountId }
  })

  if (!account) {
    throw new Error('Account not found')
  }

  const newBalance = isIncome 
    ? account.balance + amount 
    : account.balance - amount

  return await prisma.account.update({
    where: { id: accountId },
    data: { balance: newBalance }
  })
}

export async function getMonthlyExpenditure(userId: string, year: number, month: number) {
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0, 23, 59, 59)

  const result = await prisma.transaction.aggregate({
    where: {
      userId,
      type: 'EXPENSE',
      date: {
        gte: startDate,
        lte: endDate
      }
    },
    _sum: {
      amount: true
    }
  })

  return result._sum.amount || 0
}

export async function getCategoryExpenditure(userId: string, categoryId: string, startDate: Date, endDate: Date) {
  const result = await prisma.transaction.aggregate({
    where: {
      userId,
      categoryId,
      type: 'EXPENSE',
      date: {
        gte: startDate,
        lte: endDate
      }
    },
    _sum: {
      amount: true
    }
  })

  return result._sum.amount || 0
}