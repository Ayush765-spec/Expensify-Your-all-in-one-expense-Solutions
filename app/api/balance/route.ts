import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getUserBalance, getMonthlyExpenditure } from '@/lib/db/balance'
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

    const { searchParams } = new URL(request.url)
    const includeMonthly = searchParams.get('monthly') === 'true'
    
    const balanceData = await getUserBalance(user.id)
    
    const response: any = {
      totalBalance: balanceData.totalBalance,
      accounts: balanceData.accounts
    }

    if (includeMonthly) {
      const currentDate = new Date()
      const currentMonth = currentDate.getMonth() + 1
      const currentYear = currentDate.getFullYear()
      
      response.monthlyExpenditure = await getMonthlyExpenditure(user.id, currentYear, currentMonth)
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Get balance error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch balance data' 
    }, { status: 500 })
  }
}