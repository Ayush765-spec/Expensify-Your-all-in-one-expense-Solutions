import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { findUserByClerkId, createUser, initializeUserData } from '@/lib/db/user'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let user = await findUserByClerkId(clerkUserId)
    if (!user) {
      const newUser = await createUser(clerkUserId, 'user@example.com')
      await initializeUserData(newUser.id)
      user = await findUserByClerkId(clerkUserId)
    }

    if (!user) {
      return NextResponse.json({ error: 'Failed to initialize user data' }, { status: 500 })
    }

    const categories = await prisma.category.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        name: true
      }
    })

    return NextResponse.json({ categories })

  } catch (error) {
    console.error('Get categories error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch categories' 
    }, { status: 500 })
  }
}
