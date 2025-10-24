import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

interface AddTransactionRequest {
  date: string
  account: string
  category: string
  type: "Income" | "Expense"
  amount: number
  status: "Cleared" | "Pending"
  notes?: string
}

export async function POST(req: NextRequest) {
  try {
    console.log('=== Add Transaction API Called ===')
    
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      console.log('❌ User not authenticated')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.log('✅ User authenticated:', userId)

    const body: AddTransactionRequest = await req.json()
    console.log('📝 Transaction data received:', body)

    // Validate required fields
    const { date, account, category, type, amount, status, notes } = body
    
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

    // Generate transaction ID
    const transactionId = `TXN-${Math.floor(1000 + Math.random() * 9000)}`
    
    const transaction = {
      id: transactionId,
      date,
      account,
      category,
      type,
      amount,
      status,
      ...(notes && { notes })
    }
    
    console.log('✅ Transaction created:', transaction)

    // In a real application, you would save this to a database
    // For now, we'll just return the created transaction
    // The frontend will handle adding it to the local state
    
    return NextResponse.json({ 
      success: true, 
      transaction,
      message: 'Transaction added successfully'
    })

  } catch (error) {
    console.error('❌ Add transaction error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}