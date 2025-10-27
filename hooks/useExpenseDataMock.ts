'use client'

import { useState, useMemo, useCallback } from 'react'
import { formatINR } from '@/lib/utils'

interface Transaction {
  id: string
  type: 'Income' | 'Expense'
  amount: number
  category: string
  account: string
  date: string
  description: string
  status: string
}

interface Summary {
  totalIncome: number
  totalExpenses: number
  netCashflow: number
  savingsRate: number
  formatted: {
    income: string
    expenses: string
    netCashflow: string
  }
}

interface CategoryBreakdown {
  name: string
  value: number
  percent: number
}

interface MonthlyTrend {
  month: string
  income: number
  expenses: number
}

// Initial mock transactions
const initialTransactions: Transaction[] = [
  {
    id: '1',
    type: 'Income',
    amount: 75000,
    category: 'Salary',
    account: 'Primary Savings',
    date: '2024-10-15',
    description: 'October salary',
    status: 'Cleared'
  },
  {
    id: '2',
    type: 'Expense',
    amount: 2500,
    category: 'Food',
    account: 'Credit Card',
    date: '2024-10-20',
    description: 'Grocery shopping at BigBazaar',
    status: 'Cleared'
  },
  {
    id: '3',
    type: 'Expense',
    amount: 15000,
    category: 'Shopping',
    account: 'Credit Card',
    date: '2024-10-22',
    description: 'Electronics purchase',
    status: 'Pending'
  },
  {
    id: '4',
    type: 'Income',
    amount: 8000,
    category: 'Freelance',
    account: 'Checking Account',
    date: '2024-10-25',
    description: 'Web development project',
    status: 'Cleared'
  },
  {
    id: '5',
    type: 'Expense',
    amount: 1200,
    category: 'Transport',
    account: 'Primary Savings',
    date: '2024-10-26',
    description: 'Monthly metro card',
    status: 'Cleared'
  }
]

export function useExpenseDataMock() {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calculate aggregates
  const aggregates = useMemo(() => {
    return transactions.reduce(
      (acc, txn) => {
        if (txn.type === 'Income') {
          acc.income += txn.amount
        } else {
          acc.expenses += txn.amount
        }
        return acc
      },
      { income: 0, expenses: 0 }
    )
  }, [transactions])

  const netCashflow = aggregates.income - aggregates.expenses
  const savingsRate = aggregates.income === 0 ? 0 : netCashflow / aggregates.income

  // Calculate category breakdown
  const categoryBreakdown = useMemo(() => {
    const totals = transactions.reduce<Record<string, number>>((acc, txn) => {
      if (txn.type === 'Expense') {
        acc[txn.category] = (acc[txn.category] || 0) + txn.amount
      }
      return acc
    }, {})

    return Object.entries(totals)
      .map(([name, value]) => ({
        name,
        value,
        percent: aggregates.expenses === 0 ? 0 : value / aggregates.expenses,
      }))
      .sort((a, b) => b.value - a.value)
  }, [transactions, aggregates.expenses])

  const topCategory = categoryBreakdown[0] || null

  // Generate monthly trend
  const monthlyTrend = useMemo((): MonthlyTrend[] => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']
    const currentMonth = new Date().getMonth()
    
    return months.slice(Math.max(0, currentMonth - 5), currentMonth + 1).map((month, index) => {
      // Simple calculation - distribute transactions across months
      const monthlyIncome = aggregates.income * (0.7 + Math.random() * 0.6) / 6
      const monthlyExpenses = aggregates.expenses * (0.7 + Math.random() * 0.6) / 6
      
      return {
        month,
        income: monthlyIncome,
        expenses: monthlyExpenses
      }
    })
  }, [aggregates])

  // Add transaction function
  const addTransaction = useCallback(async (transactionData: Omit<Transaction, 'id'>) => {
    try {
      console.log('Adding transaction to mock data:', transactionData)
      setLoading(true)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const newTransaction: Transaction = {
        ...transactionData,
        id: Date.now().toString() // Simple ID generation
      }
      
      setTransactions(prev => [newTransaction, ...prev])
      console.log('Transaction added successfully to mock data:', newTransaction)
      return { transaction: newTransaction }
    } catch (err) {
      console.error('Error adding transaction:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Update transaction function
  const updateTransaction = useCallback((id: string, updates: Partial<Omit<Transaction, 'id'>>) => {
    setTransactions(prev => 
      prev.map(txn => 
        txn.id === id ? { ...txn, ...updates } : txn
      )
    )
    console.log('Transaction updated:', id, updates)
  }, [])

  // Delete transaction function
  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(txn => txn.id !== id))
    console.log('Transaction deleted:', id)
  }, [])

  const summary: Summary = {
    totalIncome: aggregates.income,
    totalExpenses: aggregates.expenses,
    netCashflow,
    savingsRate,
    formatted: {
      income: formatINR(aggregates.income),
      expenses: formatINR(aggregates.expenses),
      netCashflow: formatINR(netCashflow),
    },
  }

  return {
    summary,
    monthlyTrend,
    categoryBreakdown,
    insights: {
      emergencyFund: aggregates.income * 0.25, // Simplified calculation
      topCategory,
    },
    recentTransactions: transactions.slice(0, 6),
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    loading,
    error,
    refetch: () => Promise.resolve(),
  }
}