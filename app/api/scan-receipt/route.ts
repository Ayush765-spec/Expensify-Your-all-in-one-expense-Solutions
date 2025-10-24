import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    console.log('Receipt scan request received')
    
    if (!process.env.GEMINI_API_KEY) {
      console.log('No Gemini API key found')
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    console.log('Parsing form data...')
    const formData = await request.formData()
    const file = formData.get('file') as File
    
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

    console.log('Initializing Gemini model...')
    // Initialize Gemini model (using working model from API)
    const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' })

    // Create prompt for receipt analysis
    const prompt = `
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

    console.log('Sending request to Gemini...')
    // Generate content with the image
    const imagePart = {
      inlineData: {
        data: base64,
        mimeType: mimeType,
      },
    }

    const result = await model.generateContent([prompt, imagePart])
    console.log('Gemini response received')
    const response = await result.response
    let text = response.text()
    console.log('Raw response length:', text.length)

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
      errorMessage = error.message
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.stack : String(error)
      },
      { status: 500 }
    )
  }
}