'use client'

import { useExpenseData } from './useExpenseData'
import { useExpenseDataDB } from './useExpenseDataDB'

// Environment variable to control data source
const USE_DATABASE = process.env.NEXT_PUBLIC_USE_DATABASE === 'true'

/**
 * Smart hook that switches between mock data and database data
 * based on environment configuration
 */
export function useExpenseDataSwitcher() {
  const mockData = useExpenseData()
  const dbData = useExpenseDataDB()

  return USE_DATABASE ? dbData : mockData
}

/**
 * Force use database data (useful for components that specifically need DB features)
 */
export function useExpenseDataForceDB() {
  return useExpenseDataDB()
}

/**
 * Force use mock data (useful for testing or offline mode)
 */
export function useExpenseDataForceMock() {
  return useExpenseData()
}