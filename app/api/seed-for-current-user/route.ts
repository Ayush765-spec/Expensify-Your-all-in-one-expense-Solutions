import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log(`🌱 Starting database seed for user: ${clerkUserId}...`)

    const user = await prisma.user.upsert({
      where: { clerkId: clerkUserId },
      update: {},
      create: {
        clerkId: clerkUserId,
        email: 'seededuser@example.com', // You might want to get this from Clerk
      },
    })

    console.log('✅ Created/found user:', user.id)

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
          where: { userId_name: { userId: user.id, name: category.name } },
          update: {},
          create: { ...category, userId: user.id },
        })
      )
    )

    console.log('✅ Created categories:', createdCategories.length)

    const accounts = [
      { name: 'Primary Savings', type: 'savings', balance: 50000 },
      { name: 'Checking Account', type: 'checking', balance: 25000 },
      { name: 'Credit Card', type: 'credit', balance: -5000 },
    ]

    const createdAccounts = await Promise.all(
      accounts.map(account =>
        prisma.account.upsert({
          where: { userId_name: { userId: user.id, name: account.name } },
          update: {},
          create: { ...account, userId: user.id },
        })
      )
    )

    console.log('✅ Created accounts:', createdAccounts.length)

    // Clear existing transactions for this user to avoid duplicates
    await prisma.transaction.deleteMany({ where: { userId: user.id } })

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

    await prisma.transaction.createMany({
      data: transactions.map(tx => ({ ...tx, userId: user.id }))
    })

    console.log('✅ Created sample transactions:', transactions.length)
    return NextResponse.json({ success: true, message: `Seeded ${transactions.length} transactions for user ${clerkUserId}` })

  } catch (error) {
    console.error('❌ Seed for current user error:', error)
    return NextResponse.json({ error: 'Failed to seed data' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
