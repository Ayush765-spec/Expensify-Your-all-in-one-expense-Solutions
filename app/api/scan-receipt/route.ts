import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import OpenAI from 'openai'
import { auth } from '@clerk/nextjs/server'
import { createTransaction } from '@/lib/db/transactions'
import { findUserByClerkId, initializeUserData, createUser } from '@/lib/db/user'
import { prisma } from '@/lib/prisma'

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null

// Receipt analysis prompt
const RECEIPT_ANALYSIS_PROMPT = `
Analyze this receipt image and extract the following information in a structured JSON format:

{
  "merchant_name": "string",
  "date": "YYYY-MM-DD format",
  "time": "HH:MM format (24-hour)",
  "total_amount": "number (decimal)",
  "currency": "string (3-letter code if visible, otherwise INR)",
  "tax_amount": "number (if available)",
  "items": [
    {
      "name": "string",
      "quantity": "number",
      "unit_price": "number",
      "total_price": "number"
    }
  ],
  "payment_method": "string (if visible)",
  "receipt_number": "string (if visible)",
  "category": "string (food, groceries, transport, entertainment, etc.)"
}

Please ensure:
- All monetary values are numbers without currency symbols
- Dates are in YYYY-MM-DD format
- Times are in 24-hour HH:MM format
- If any information is not clearly visible, use null for that field
- Categorize the expense based on the merchant type and items
- Return only the JSON object, no additional text
`

async function analyzeReceiptWithGemini(base64: string, mimeType: string) {
  if (!genAI) {
    throw new Error('Gemini API not configured')
  }

  console.log('Using Gemini AI for receipt analysis...')
  const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' })

  const imagePart = {
    inlineData: {
      data: base64,
      mimeType: mimeType,
    },
  }

  const result = await model.generateContent([RECEIPT_ANALYSIS_PROMPT, imagePart])
  const response = await result.response
  return response.text()
}

async function analyzeReceiptWithOpenAI(base64: string, mimeType: string) {
  if (!openai) {
    throw new Error('OpenAI API not configured')
  }

  console.log('Using OpenAI GPT-4 Vision for receipt analysis...')
  
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: RECEIPT_ANALYSIS_PROMPT
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${base64}`,
              detail: "high"
            }
          }
        ]
      }
    ],
    max_tokens: 1000,
    temperature: 0.1,
  })

  return response.choices[0]?.message?.content || ''
}

async function analyzeReceipt(base64: string, mimeType: string): Promise<{ result: string; service: 'gemini' | 'openai' }> {
  const errors: string[] = []
  
  // Try Gemini first if available
  if (genAI) {
    try {
      const result = await analyzeReceiptWithGemini(base64, mimeType)
      console.log('✅ Gemini analysis successful')
      return { result, service: 'gemini' }
    } catch (error) {
      console.error('❌ Gemini analysis failed:', error)
      errors.push(`Gemini: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  } else {
    errors.push('Gemini: API key not configured')
  }
  
  // Try OpenAI as fallback
  if (openai) {
    try {
      const result = await analyzeReceiptWithOpenAI(base64, mimeType)
      console.log('✅ OpenAI analysis successful (fallback)')
      return { result, service: 'openai' }
    } catch (error) {
      console.error('❌ OpenAI analysis failed:', error)
      errors.push(`OpenAI: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  } else {
    errors.push('OpenAI: API key not configured')
  }
  
  throw new Error(`All AI services failed: ${errors.join(', ')}`)
}

export async function POST(request: NextRequest) {
  try {
    console.log('Receipt scan request received')
    
    if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
      console.log('No AI API keys found')
      return NextResponse.json(
        { error: 'No AI service configured. Please set GEMINI_API_KEY or OPENAI_API_KEY environment variable.' },
        { status: 500 }
      )
    }
    
    // Check if database is enabled for auto-save functionality
    const useDatabaseStr = process.env.NEXT_PUBLIC_USE_DATABASE
    const useDatabase = useDatabaseStr === 'true'
    console.log('Database mode:', useDatabase ? 'enabled' : 'disabled')

    console.log('Parsing form data...')
    const formData = await request.formData()
    const file = formData.get('file') as File
    const autoSave = formData.get('autoSave') === 'true'
    
    console.log('File received:', file?.name, file?.size, file?.type)

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload an image file.' },
        { status: 400 }
      )
    }

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Please upload an image smaller than 10MB.' },
        { status: 400 }
      )
    }

    console.log('Converting file to base64...')
    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')

    // Get file type
    const mimeType = file.type
    console.log('File converted successfully. MIME type:', mimeType)

    console.log('Starting AI analysis...')
    // Analyze receipt using available AI service
    const analysisResult = await analyzeReceipt(base64, mimeType)
    let text = analysisResult.result
    const aiService = analysisResult.service
    console.log(`AI response received from ${aiService}, length:`, text.length)

    // Clean up the response to extract JSON
    text = text.trim()
    if (text.startsWith('```json')) {
      text = text.substring(7)
    }
    if (text.endsWith('```')) {
      text = text.substring(0, text.length - 3)
    }
    text = text.trim()

    try {
      const parsedData = JSON.parse(text)
      
      // Add metadata about which AI service was used
      parsedData.aiService = aiService
      parsedData.aiServiceDisplayName = aiService === 'openai' ? 'OpenAI GPT-4 Vision' : 'Google Gemini'
      
      // Check if user wants to auto-save transaction
      
      if (autoSave) {
        if (!useDatabase) {
          parsedData.autoSaveError = 'Auto-save requires database mode to be enabled'
        } else {
          // Check authentication
          const { userId: clerkUserId } = await auth()
          if (clerkUserId) {
            try {
              // Test database connection
              await prisma.$connect()
              console.log('✅ Database connection successful for receipt scan')
              
              // Find or create user in database
              let user = await findUserByClerkId(clerkUserId)
              if (!user) {
                console.log('Creating new user in database for receipt scan')
                // Get user details from Clerk
                const { sessionClaims } = await auth()
                const userEmail = sessionClaims?.email as string || 'user@example.com'
                const newUser = await createUser(clerkUserId, userEmail)
                await initializeUserData(newUser.id)
                // Fetch the complete user with accounts and categories
                user = await findUserByClerkId(clerkUserId)
              }

              if (!user) {
                parsedData.autoSaveError = 'Failed to initialize user data'
                return NextResponse.json(parsedData)
              }

          // Find appropriate category based on receipt category
          let categoryRecord = await prisma.category.findFirst({
            where: { 
              userId: user.id, 
              name: { 
                contains: parsedData.category, 
                mode: 'insensitive' 
              } 
            }
          })
          
          // If no matching category found, use a default one
          if (!categoryRecord) {
            categoryRecord = await prisma.category.findFirst({
              where: { userId: user.id }
            })
          }

          // Find default account
          const account = await prisma.account.findFirst({
            where: { userId: user.id, isActive: true }
          })

          if (categoryRecord && account && parsedData.total_amount) {
            try {
              const transaction = await createTransaction({
                userId: user.id,
                accountId: account.id,
                categoryId: categoryRecord.id,
                amount: parsedData.total_amount,
                type: 'EXPENSE',
                date: parsedData.date ? new Date(parsedData.date) : new Date(),
                description: `Receipt from ${parsedData.merchant_name || 'Unknown merchant'}`,
                notes: parsedData.items ? `Items: ${parsedData.items.map((item: any) => item.name).join(', ')}` : undefined,
                status: 'CLEARED',
                receiptData: parsedData
              })
              
              parsedData.transactionId = transaction.id
              parsedData.autoSaved = true
              console.log('✅ Receipt data auto-saved as transaction:', transaction.id)
            } catch (saveError) {
              console.error('❌ Failed to auto-save receipt transaction:', saveError)
              parsedData.autoSaveError = 'Failed to save transaction automatically'
            }
          } else {
            parsedData.autoSaveError = 'Unable to find default category or account for auto-save'
          }
            } catch (dbError) {
              console.error('❌ Database error during receipt auto-save:', dbError)
              parsedData.autoSaveError = 'Database connection failed during auto-save'
            }
          } else {
            parsedData.autoSaveError = 'Auto-save requires authentication'
          }
        }
      }
      
      return NextResponse.json(parsedData)
    } catch (parseError) {
      // If JSON parsing fails, return the raw text
      return NextResponse.json({
        error: 'Failed to parse receipt data',
        raw_response: text,
      })
    }

  } catch (error) {
    console.error('Receipt scanning error:', error)
    
    // Provide more detailed error information
    let errorMessage = 'Failed to process receipt'
    if (error instanceof Error) {
      // Check for specific error types
      if (error.message.includes('API_KEY') || error.message.includes('not configured')) {
        errorMessage = 'AI service configuration error'
      } else if (error.message.includes('P1001')) {
        errorMessage = 'Database connection failed'
      } else if (error.message.includes('ECONNREFUSED') || error.message.includes('overloaded')) {
        errorMessage = 'AI service is unavailable'
      } else if (error.message.includes('All AI services failed')) {
        errorMessage = error.message
      } else {
        errorMessage = error.message
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : String(error)) : undefined
      },
      { status: 500 }
    )
  } finally {
    try {
      await prisma.$disconnect()
    } catch (disconnectError) {
      console.log('Note: Prisma disconnect completed')
    }
  }
}