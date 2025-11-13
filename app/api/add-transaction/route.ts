import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createTransaction } from '@/lib/db/transactions'
import { findUserByClerkId, createUser, initializeUserData } from '@/lib/db/user'
import { prisma } from '@/lib/prisma'

interface AddTransactionRequest {
  date: string
  account: string
  category: string
  type: "Income" | "Expense"
  amount: number
  status: "Cleared" | "Pending"
  notes?: string
  description?: string
}

export async function POST(req: NextRequest) {
  try {
    console.log('=== Add Transaction API Called ===')
    
    // Check authentication
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      console.log('❌ User not authenticated')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.log('✅ User authenticated:', clerkUserId)

    // Find or create user in database
    let user = await findUserByClerkId(clerkUserId)
    if (!user) {
      console.log('🔄 Creating new user in database...')
      const newUser = await createUser(clerkUserId, 'user@example.com')
      await initializeUserData(newUser.id)
      user = await findUserByClerkId(clerkUserId)
    }

    if (!user) {
      console.log('❌ Failed to create/find user')
      return NextResponse.json({ error: 'Failed to initialize user data' }, { status: 500 })
    }

    const body: AddTransactionRequest = await req.json()
    console.log('📝 Transaction data received:', body)

    // Validate required fields
    const { date, account, category, type, amount, status, notes, description } = body
    
    if (!date || !account || !category || !type || typeof amount !== 'number' || !status) {
      console.log('❌ Missing required fields')
      return NextResponse.json({ 
        error: 'Missing required fields: date, account, category, type, amount, status' 
      }, { status: 400 })
    }

    // Validate type
    if (type !== 'Income' && type !== 'Expense') {
      console.log('❌ Invalid transaction type:', type)
      return NextResponse.json({ 
        error: 'Type must be either "Income" or "Expense"' 
      }, { status: 400 })
    }

    // Validate status
    if (status !== 'Cleared' && status !== 'Pending') {
      console.log('❌ Invalid transaction status:', status)
      return NextResponse.json({ 
        error: 'Status must be either "Cleared" or "Pending"' 
      }, { status: 400 })
    }

    // Validate amount
    if (amount <= 0) {
      console.log('❌ Invalid amount:', amount)
      return NextResponse.json({ 
        error: 'Amount must be greater than 0' 
      }, { status: 400 })
    }

    // Find the account and category by name for this user
    const userAccount = await prisma.account.findFirst({
      where: {
        userId: user.id,
        name: account
      }
    })

    const userCategory = await prisma.category.findFirst({
      where: {
        userId: user.id,
        name: category
      }
    })

    if (!userAccount) {
      console.log('❌ Account not found:', account)
      return NextResponse.json({ 
        error: `Account "${account}" not found` 
      }, { status: 400 })
    }

    if (!userCategory) {
      console.log('❌ Category not found:', category)
      return NextResponse.json({ 
        error: `Category "${category}" not found` 
      }, { status: 400 })
    }

    console.log('✅ Account found:', userAccount.name)
    console.log('✅ Category found:', userCategory.name)

    // Use the createTransaction function with proper database relations
    const savedTransaction = await createTransaction({
      userId: user.id,
      accountId: userAccount.id,
      categoryId: userCategory.id,
      amount: amount,
      type: type === 'Income' ? 'INCOME' : 'EXPENSE',
      date: new Date(date),
      description: description,
      notes: notes,
      status: status === 'Cleared' ? 'CLEARED' : 'PENDING'
    })

    console.log('✅ Transaction saved to database:', savedTransaction.id)

    // Format response to match expected format
    const formattedTransaction = {
      id: savedTransaction.id,
      date: savedTransaction.date.toISOString().split('T')[0],
      account: savedTransaction.account?.name || account,
      category: savedTransaction.category?.name || category,
      type: type,
      amount: savedTransaction.amount,
      status: status,
      notes: savedTransaction.notes,
      description: savedTransaction.description
    }

    return NextResponse.json({
      success: true,
      transaction: formattedTransaction,
      message: 'Transaction added successfully',
    });

  } catch (error) {
    console.error('❌ Add transaction error:', error);

    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({
      error: `Internal server error: ${errorMessage}`
    }, { status: 500 });
  }
}