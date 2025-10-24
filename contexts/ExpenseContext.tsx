'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useExpenseData } from '@/hooks/useExpenseData'

// Create the context
const ExpenseContext = createContext<ReturnType<typeof useExpenseData> | null>(null)

// Provider component
export function ExpenseProvider({ children }: { children: ReactNode }) {
  const expenseData = useExpenseData()
  
  return (
    <ExpenseContext.Provider value={expenseData}>
      {children}
    </ExpenseContext.Provider>
  )
}

// Custom hook to use the context
export function useExpenseContext() {
  const context = useContext(ExpenseContext)
  if (!context) {
    throw new Error('useExpenseContext must be used within an ExpenseProvider')
  }
  return context
}