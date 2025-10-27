# AI Services Setup for Receipt Scanner

The receipt scanner now supports multiple AI services for better reliability. When Google Gemini is overloaded or unavailable, the system will automatically fall back to OpenAI GPT-4 Vision.

## Current Setup

Your system is currently configured with:
- ✅ Google Gemini API (Primary)
- ❌ OpenAI API (Not configured - Recommended as backup)

## Adding OpenAI as Backup Service

### Step 1: Get an OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the API key (it starts with `sk-`)

### Step 2: Add the API Key to Your Environment

Add this line to your `.env.local` file:

```env
# OpenAI API (Fallback for receipt scanning)
OPENAI_API_KEY=your_openai_api_key_here
```

### Step 3: Restart Your Development Server

After adding the API key, restart your Next.js development server:

```bash
npm run dev
```

## How the System Works

1. **Primary**: Google Gemini processes receipt images first
2. **Fallback**: If Gemini fails (overloaded, API error), OpenAI GPT-4 Vision takes over
3. **User Feedback**: The UI shows which AI service was used for transparency

## API Costs

- **Google Gemini**: Usually free tier available
- **OpenAI GPT-4 Vision**: Pay-per-use (approximately $0.01-0.03 per image)

## Troubleshooting

### Error: "All AI services failed"
- Check both API keys are valid
- Verify your OpenAI account has credits
- Ensure image is valid (JPG, PNG, WebP under 10MB)

### Error: "AI service is unavailable" 
- This typically means Google Gemini is overloaded
- Having OpenAI as backup will resolve this automatically

## Testing the Setup

1. Upload a receipt image
2. Click "Scan Receipt"
3. Check the badge in the results section to see which AI service was used
4. If you see "OpenAI GPT-4 Vision", the fallback system is working correctly