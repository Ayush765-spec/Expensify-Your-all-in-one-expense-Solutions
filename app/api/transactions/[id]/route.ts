import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { updateTransaction, deleteTransaction } from '@/lib/db/transactions'
import { findUserByClerkId } from '@/lib/db/user'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await findUserByClerkId(clerkUserId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const resolvedParams = await params
    const transactionId = resolvedParams.id
    const updates = await request.json()

    const updatedTransaction = await updateTransaction(transactionId, user.id, updates)

    return NextResponse.json({
      success: true,
      transaction: {
        id: updatedTransaction.id,
        date: updatedTransaction.date.toISOString().split('T')[0],
        account: updatedTransaction.account.name,
        category: updatedTransaction.category.name,
        type: updatedTransaction.type === 'INCOME' ? 'Income' : 'Expense',
        amount: updatedTransaction.amount,
        status: updatedTransaction.status === 'CLEARED' ? 'Cleared' : 'Pending',
        notes: updatedTransaction.notes,
        description: updatedTransaction.description
      }
    })

  } catch (error) {
    console.error('Update transaction error:', error)
    return NextResponse.json({ 
      error: 'Failed to update transaction' 
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await findUserByClerkId(clerkUserId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const resolvedParams = await params
    const transactionId = resolvedParams.id

    await deleteTransaction(transactionId, user.id)

    return NextResponse.json({
      success: true,
      message: 'Transaction deleted successfully'
    })

  } catch (error) {
    console.error('Delete transaction error:', error)
    return NextResponse.json({ 
      error: 'Failed to delete transaction' 
    }, { status: 500 })
  }
}