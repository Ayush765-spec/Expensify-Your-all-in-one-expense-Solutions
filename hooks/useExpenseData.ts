'use client'

import { useMemo, useState, useCallback } from 'react'
import {
  transactions as initialTransactions,
  monthlyExpenseTrend,
  cashflowInsights,
} from '@/lib/data/transactions'

import type { Transaction } from '@/lib/data/transactions'
import { formatINR } from '@/lib/utils'

function createTransactionId() {
  return `TXN-${Math.floor(1000 + Math.random() * 9000)}`
}

export function useExpenseData() {
  const [transactionList, setTransactionList] = useState(initialTransactions)

  const aggregates = useMemo(() => {
    return transactionList.reduce(
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
  }, [transactionList])

  const netCashflow = aggregates.income - aggregates.expenses
  const savingsRate = aggregates.income === 0 ? 0 : netCashflow / aggregates.income

  const categoryBreakdown = useMemo(() => {
    const totals = transactionList.reduce<Record<string, number>>((acc, txn) => {
      if (txn.type === 'Expense') {
        acc[txn.category] = (acc[txn.category] ?? 0) + txn.amount
      }
      return acc
    }, {})

    return Object.entries(totals).map(([name, value]) => ({
      name,
      value,
      percent: aggregates.expenses === 0 ? 0 : value / aggregates.expenses,
    }))
  }, [transactionList, aggregates.expenses])

  const topCategory = categoryBreakdown.slice().sort((a, b) => b.value - a.value)[0] ?? null

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    setTransactionList((prev) => [
      {
        ...transaction,
        id: createTransactionId(),
      },
      ...prev,
    ])
  }, [])

  const updateTransaction = useCallback((id: string, updates: Partial<Omit<Transaction, 'id'>>) => {
    setTransactionList((prev) => prev.map((txn) => (txn.id === id ? { ...txn, ...updates } : txn)))
  }, [])

  const deleteTransaction = useCallback((id: string) => {
    setTransactionList((prev) => prev.filter((txn) => txn.id !== id))
  }, [])

  return {
    summary: {
      totalIncome: aggregates.income,
      totalExpenses: aggregates.expenses,
      netCashflow,
      savingsRate,
      formatted: {
        income: formatINR(aggregates.income),
        expenses: formatINR(aggregates.expenses),
        netCashflow: formatINR(netCashflow),
      },
    },
    monthlyTrend: monthlyExpenseTrend,
    categoryBreakdown,
    insights: {
      ...cashflowInsights,
      topCategory,
    },
    recentTransactions: transactionList.slice(0, 6),
    transactions: transactionList,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  }
}
