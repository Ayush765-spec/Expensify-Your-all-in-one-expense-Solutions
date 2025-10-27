import { prisma } from '@/lib/prisma'
import { updateAccountBalance } from './balance'
import { TransactionType, TransactionStatus } from '@prisma/client'

export interface CreateTransactionData {
  userId: string
  accountId: string
  categoryId: string
  amount: number
  type: TransactionType
  date: Date
  description?: string
  notes?: string
  status?: TransactionStatus
  receiptUrl?: string
  receiptData?: any
}

export async function createTransaction(data: CreateTransactionData) {
  const transaction = await prisma.$transaction(async (tx) => {
    // Create the transaction
    const newTransaction = await tx.transaction.create({
      data: {
        userId: data.userId,
        accountId: data.accountId,
        categoryId: data.categoryId,
        amount: data.amount,
        type: data.type,
        date: data.date,
        description: data.description,
        notes: data.notes,
        status: data.status || 'CLEARED',
        receiptUrl: data.receiptUrl,
        receiptData: data.receiptData
      },
      include: {
        account: true,
        category: true
      }
    })

    // Update account balance if transaction is cleared
    if (newTransaction.status === 'CLEARED') {
      await updateAccountBalance(
        data.accountId, 
        data.amount, 
        data.type === 'INCOME'
      )
    }

    return newTransaction
  })

  return transaction
}

export async function getUserTransactions(userId: string, limit?: number, offset?: number) {
  return await prisma.transaction.findMany({
    where: {
      userId
    },
    include: {
      account: {
        select: {
          name: true,
          type: true
        }
      },
      category: {
        select: {
          name: true,
          color: true,
          icon: true
        }
      }
    },
    orderBy: {
      date: 'desc'
    },
    take: limit,
    skip: offset
  })
}

export async function updateTransaction(transactionId: string, userId: string, updates: Partial<CreateTransactionData>) {
  const existingTransaction = await prisma.transaction.findUnique({
    where: {
      id: transactionId,
      userId // Ensure user owns the transaction
    }
  })

  if (!existingTransaction) {
    throw new Error('Transaction not found')
  }

  return await prisma.$transaction(async (tx) => {
    // If amount, type, or status changed, we need to adjust account balance
    const amountChanged = updates.amount !== undefined && updates.amount !== existingTransaction.amount
    const typeChanged = updates.type !== undefined && updates.type !== existingTransaction.type
    const statusChanged = updates.status !== undefined && updates.status !== existingTransaction.status
    const accountChanged = updates.accountId !== undefined && updates.accountId !== existingTransaction.accountId

    // Reverse the original transaction's effect if it was cleared
    if (existingTransaction.status === 'CLEARED' && (amountChanged || typeChanged || statusChanged || accountChanged)) {
      await updateAccountBalance(
        existingTransaction.accountId,
        existingTransaction.amount,
        existingTransaction.type !== 'INCOME' // Reverse the effect
      )
    }

    // Update the transaction
    const updatedTransaction = await tx.transaction.update({
      where: { id: transactionId },
      data: updates,
      include: {
        account: true,
        category: true
      }
    })

    // Apply the new transaction's effect if it's cleared
    if (updatedTransaction.status === 'CLEARED') {
      await updateAccountBalance(
        updatedTransaction.accountId,
        updatedTransaction.amount,
        updatedTransaction.type === 'INCOME'
      )
    }

    return updatedTransaction
  })
}

export async function deleteTransaction(transactionId: string, userId: string) {
  const transaction = await prisma.transaction.findUnique({
    where: {
      id: transactionId,
      userId
    }
  })

  if (!transaction) {
    throw new Error('Transaction not found')
  }

  return await prisma.$transaction(async (tx) => {
    // Reverse the transaction's effect on account balance if it was cleared
    if (transaction.status === 'CLEARED') {
      await updateAccountBalance(
        transaction.accountId,
        transaction.amount,
        transaction.type !== 'INCOME' // Reverse the effect
      )
    }

    // Delete the transaction
    return await tx.transaction.delete({
      where: { id: transactionId }
    })
  })
}

export async function getTransactionsSummary(userId: string, startDate?: Date, endDate?: Date) {
  const whereClause: any = { userId }
  
  if (startDate || endDate) {
    whereClause.date = {}
    if (startDate) whereClause.date.gte = startDate
    if (endDate) whereClause.date.lte = endDate
  }

  const [income, expenses] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        ...whereClause,
        type: 'INCOME'
      },
      _sum: {
        amount: true
      }
    }),
    prisma.transaction.aggregate({
      where: {
        ...whereClause,
        type: 'EXPENSE'
      },
      _sum: {
        amount: true
      }
    })
  ])

  const totalIncome = income._sum.amount || 0
  const totalExpenses = expenses._sum.amount || 0

  return {
    totalIncome,
    totalExpenses,
    netCashflow: totalIncome - totalExpenses,
    savingsRate: totalIncome > 0 ? (totalIncome - totalExpenses) / totalIncome : 0
  }
}