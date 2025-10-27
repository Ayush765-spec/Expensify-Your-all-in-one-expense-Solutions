'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
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

export function useExpenseDataDB() {
  const { user, isLoaded } = useUser()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch transactions from the database
  const fetchTransactions = useCallback(async () => {
    if (!user || !isLoaded) return

    try {
      setLoading(true)
      const response = await fetch('/api/transactions', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch transactions')
      }

      const data = await response.json()
      
      // Handle API response format that returns { transactions: [...] }
      const transactionsArray = data.transactions || data
      
      // Transform database data to match the expected format
      const transformedTransactions: Transaction[] = transactionsArray.map((txn: any) => ({
        id: txn.id,
        type: txn.type, // API already returns 'Income' or 'Expense'
        amount: txn.amount,
        category: txn.category || 'Unknown',
        account: txn.account || 'Unknown',
        date: txn.date,
        description: txn.description || '',
        status: txn.status // API already returns 'Cleared' or 'Pending'
      }))

      setTransactions(transformedTransactions)
      setError(null)
    } catch (err) {
      console.error('Error fetching transactions:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      // Fallback to empty array
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }, [user, isLoaded])

  // Initial fetch
  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

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

  // Generate monthly trend (simplified - you might want to make this more sophisticated)
  const monthlyTrend = useMemo((): MonthlyTrend[] => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    const currentMonth = new Date().getMonth()
    
    return months.slice(0, currentMonth + 1).map((month, index) => {
      // Simple calculation - distribute transactions across months
      const monthlyIncome = aggregates.income * (0.8 + Math.random() * 0.4) / months.length
      const monthlyExpenses = aggregates.expenses * (0.8 + Math.random() * 0.4) / months.length
      
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
      console.log('Adding transaction:', transactionData)
      
      const response = await fetch('/api/add-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: transactionData.type, // Send as-is (Income/Expense)
          amount: transactionData.amount,
          category: transactionData.category,
          account: transactionData.account,
          date: new Date(transactionData.date).toISOString(),
          description: transactionData.description,
          status: transactionData.status || 'Cleared', // Add required status field
        }),
      })

      if (!response.ok) {
        let errorMessage = 'Failed to add transaction'
        let responseBody = ''
        
        try {
          responseBody = await response.text()
          console.log('Response status:', response.status)
          console.log('Response body:', responseBody)
          
          if (responseBody.trim()) {
            try {
              const errorData = JSON.parse(responseBody)
              console.error('API Error (parsed):', errorData)
              errorMessage = errorData.error || errorData.message || errorMessage
            } catch (jsonParseError) {
              console.error('Response is not valid JSON:', jsonParseError)
              console.error('Raw response body:', responseBody)
              errorMessage = `HTTP ${response.status}: ${responseBody}`
            }
          } else {
            console.error('Empty response body')
            errorMessage = `HTTP ${response.status}: ${response.statusText || 'Unknown error'}`
          }
        } catch (textError) {
          console.error('Failed to read response text:', textError)
          errorMessage = `HTTP ${response.status}: ${response.statusText || 'Network error'}`
        }
        
        console.error('Full error details:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          headers: Object.fromEntries(response.headers.entries()),
          body: responseBody
        })
        
        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log('Transaction added successfully:', result)
      
      // Refresh transactions after adding
      await fetchTransactions()
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      console.error('Error adding transaction:', {
        error: err,
        message: errorMessage,
        transactionData: transactionData
      })
      throw err
    }
  }, [fetchTransactions])

  // Update transaction function (placeholder)
  const updateTransaction = useCallback((id: string, updates: Partial<Omit<Transaction, 'id'>>) => {
    // This would need to be implemented with a PUT endpoint
    console.log('Update transaction not implemented yet:', id, updates)
  }, [])

  // Delete transaction function (placeholder)
  const deleteTransaction = useCallback((id: string) => {
    // This would need to be implemented with a DELETE endpoint
    console.log('Delete transaction not implemented yet:', id)
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
    refetch: fetchTransactions,
  }
}