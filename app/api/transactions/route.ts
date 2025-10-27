import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getUserTransactions, getTransactionsSummary } from '@/lib/db/transactions'
import { findUserByClerkId, createUser, initializeUserData } from '@/lib/db/user'

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find or create user
    let user = await findUserByClerkId(clerkUserId)
    if (!user) {
      const newUser = await createUser(clerkUserId, 'user@example.com')
      await initializeUserData(newUser.id)
      // Fetch the complete user with accounts and categories
      user = await findUserByClerkId(clerkUserId)
    }

    if (!user) {
      console.log('❌ Failed to create/find user')
      return NextResponse.json({ error: 'Failed to initialize user data' }, { status: 500 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined
    const summary = searchParams.get('summary') === 'true'
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined

    if (summary) {
      const summaryData = await getTransactionsSummary(user.id, startDate, endDate)
      return NextResponse.json(summaryData)
    }

    const transactions = await getUserTransactions(user.id, limit, offset)
    
    // Transform to match existing format
    const formattedTransactions = transactions.map(tx => ({
      id: tx.id,
      date: tx.date.toISOString().split('T')[0],
      account: tx.account?.name || 'Unknown Account',
      category: tx.category?.name || 'Unknown Category',
      type: tx.type === 'INCOME' ? 'Income' : 'Expense',
      amount: tx.amount,
      status: tx.status === 'CLEARED' ? 'Cleared' : 'Pending',
      notes: tx.notes,
      description: tx.description
    }))

    return NextResponse.json({
      transactions: formattedTransactions,
      total: transactions.length
    })

  } catch (error) {
    console.error('Get transactions error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch transactions' 
    }, { status: 500 })
  }
}
