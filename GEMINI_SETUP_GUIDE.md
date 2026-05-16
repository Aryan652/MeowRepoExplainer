# Google Gemini Integration Setup Guide

## Overview

RepoMind now supports **Google Gemini** as an AI provider with automatic fallback to OpenAI. Gemini offers a generous **free tier** making it ideal for development and testing.

## Why Gemini?

### Free Tier Benefits
- ✅ **60 requests per minute** - Free forever
- ✅ **1,500 requests per day** - Free tier
- ✅ **1 million tokens per month** - Free tier
- ✅ **No credit card required** for free tier
- ✅ **High quality** - Comparable to GPT-4

### Cost Comparison

| Provider | Free Tier | Paid Tier |
|----------|-----------|-----------|
| **Gemini** | 60 RPM, 1.5K RPD | $0.075/$0.30 per 1M tokens |
| OpenAI | $5 credit (3 months) | $0.15/$0.60 per 1M tokens |

## Setup Instructions

### Step 1: Get Gemini API Key

1. **Visit Google AI Studio**
   - Go to [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
   - Sign in with your Google account

2. **Create API Key**
   - Click "Create API Key"
   - Select "Create API key in new project" (or use existing)
   - Copy the generated API key (starts with `AIza...`)

3. **Important Notes**
   - ⚠️ Keep your API key secret
   - ⚠️ Don't commit it to version control
   - ⚠️ Free tier has rate limits (60 RPM)

### Step 2: Configure Environment

Add your Gemini API key to your environment file:

**Option 1: Using `.env` file (Recommended)**
```bash
# Add to .env file
GEMINI_API_KEY=AIzaSy...your-key-here
```

**Option 2: Using `.dev.vars` file (Cloudflare)**
```bash
# Add to .dev.vars file
GEMINI_API_KEY=AIzaSy...your-key-here
```

**Option 3: Using `GOOGLE_API_KEY` (Alternative)**
```bash
# Also supported
GOOGLE_API_KEY=AIzaSy...your-key-here
```

### Step 3: Restart Application

```bash
# Stop current server (Ctrl+C)

# Restart
npm run dev
# or
bun run dev
```

### Step 4: Verify Configuration

Check the startup logs for:

```
🔧 Configuration Status:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Environment: development
App URL: http://localhost:8080

Features:
  Database: ✅
  Authentication: ✅
  AI Analysis: ✅
  AI Provider: gemini  ← Should show "gemini"
  GitHub Integration: ✅
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Also look for:
```
[GeminiService] Gemini service initialized
```

## How It Works

### Automatic Provider Selection

The system automatically chooses the AI provider:

1. **Gemini First** - If `GEMINI_API_KEY` is set
2. **OpenAI Fallback** - If only `OPENAI_API_KEY` is set
3. **Error** - If neither is configured

### Code Example

```typescript
// Automatic selection in agents
const aiService = config.isGeminiConfigured ? geminiService : openaiService;

// Use the selected service
const result = await aiService.chatCompletion(messages, options);
```

### Supported Models

**Gemini Models:**
- `gemini-2.0-flash-exp` - Latest, fastest (default)
- `gemini-1.5-flash` - Stable, fast
- `gemini-1.5-pro` - Most capable

**OpenAI Models (fallback):**
- `gpt-4o-mini` - Fast, cost-effective (default)
- `gpt-4o` - Most capable
- `gpt-3.5-turbo` - Fastest

## Testing

### Test Documentation Generation

1. Navigate to a repository docs page: `/repo/{repoId}/docs`
2. Click "Generate Docs" button
3. Monitor the logs for Gemini usage:

```
[GeminiService] Chat completion request
[DocumentationAgent] Generating README
[GeminiService] Chat completion response
```

### Test API Directly

```typescript
import { geminiService } from "@/services/gemini.service";

// Test chat completion
const result = await geminiService.chatCompletion([
  { role: "user", content: "Hello, Gemini!" }
]);

console.log(result.content);
```

## Rate Limits

### Free Tier Limits

| Limit Type | Value |
|------------|-------|
| Requests per minute | 60 |
| Requests per day | 1,500 |
| Tokens per month | 1,000,000 |

### Handling Rate Limits

The service automatically handles rate limits:

```typescript
// Built-in retry logic
try {
  const result = await geminiService.chatCompletion(messages);
} catch (error) {
  if (error.message.includes("429")) {
    // Rate limit hit - wait and retry
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}
```

### Optimization Tips

1. **Batch Requests** - Process multiple items together
2. **Cache Results** - Store generated docs in database
3. **Reduce Token Usage** - Limit sample files and max tokens
4. **Monitor Usage** - Check Google AI Studio dashboard

## Troubleshooting

### Common Issues

#### 1. "Gemini client not configured"

**Problem:** API key not set or invalid

**Solution:**
```bash
# Check environment variable
echo $GEMINI_API_KEY

# Verify in .env file
cat .env | grep GEMINI

# Restart application
npm run dev
```

#### 2. "400 invalid model ID"

**Problem:** Using wrong model name

**Solution:**
- Check model name in `gemini.service.ts`
- Should be `gemini-2.0-flash-exp` or `gemini-1.5-flash`
- NOT `Gemini 2.5 Flash` (incorrect format)

#### 3. "429 Rate limit exceeded"

**Problem:** Hit free tier limits

**Solution:**
- Wait 1 minute for RPM reset
- Wait 24 hours for daily reset
- Upgrade to paid tier if needed
- Implement caching to reduce requests

#### 4. "API key not valid"

**Problem:** Invalid or expired API key

**Solution:**
- Generate new key at [aistudio.google.com](https://aistudio.google.com/app/apikey)
- Update `.env` file
- Restart application

### Debug Mode

Enable detailed logging:

```bash
# Set log level to debug
LOG_LEVEL=debug npm run dev
```

Look for:
```
[GeminiService] Generating embedding
[GeminiService] Chat completion request
[GeminiService] Chat completion response
```

## Migration from OpenAI

### Switching from OpenAI to Gemini

1. **Keep OpenAI key** (for fallback)
2. **Add Gemini key**
3. **Restart application**
4. **System automatically uses Gemini**

```bash
# .env file
OPENAI_API_KEY=sk-...  # Keep as fallback
GEMINI_API_KEY=AIza... # Add this - will be used first
```

### Switching Back to OpenAI

Simply remove or comment out Gemini key:

```bash
# .env file
OPENAI_API_KEY=sk-...
# GEMINI_API_KEY=AIza...  # Commented out
```

System will automatically fall back to OpenAI.

## API Compatibility

Both services implement the same interface:

```typescript
interface AIService {
  isAvailable(): boolean;
  generateEmbedding(text: string): Promise<EmbeddingResult>;
  chatCompletion(messages: ChatMessage[], options): Promise<ChatCompletionResult>;
  generateDocumentation(code: string, language: string): Promise<string>;
  analyzeSecurityIssues(code: string, language: string): Promise<string>;
  // ... more methods
}
```

This means:
- ✅ No code changes needed
- ✅ Seamless switching between providers
- ✅ Same API for all agents
- ✅ Automatic fallback

## Best Practices

### 1. Use Gemini for Development

```bash
# Development .env
GEMINI_API_KEY=AIza...  # Free tier
```

### 2. Use OpenAI for Production

```bash
# Production .env
OPENAI_API_KEY=sk-...   # Paid tier with higher limits
GEMINI_API_KEY=AIza...  # Fallback
```

### 3. Monitor Usage

- Check [Google AI Studio Dashboard](https://aistudio.google.com)
- Track requests per day
- Monitor token usage
- Set up alerts for limits

### 4. Implement Caching

```typescript
// Cache generated docs
const cachedDoc = await db.select()
  .from(repositoryDocs)
  .where(eq(repositoryDocs.repositoryId, repoId));

if (cachedDoc) {
  return cachedDoc; // Use cache
}

// Generate only if not cached
const result = await geminiService.chatCompletion(...);
```

### 5. Handle Errors Gracefully

```typescript
try {
  const result = await geminiService.chatCompletion(messages);
} catch (error) {
  logger.error("Gemini request failed", error);
  
  // Fallback to OpenAI if available
  if (openaiService.isAvailable()) {
    return await openaiService.chatCompletion(messages);
  }
  
  throw error;
}
```

## Cost Comparison Example

### Generating 100 Documentation Sets

**With Gemini (Free Tier):**
- Cost: $0.00
- Time: ~10 minutes
- Requests: ~1,300 (within daily limit)

**With OpenAI (Paid):**
- Cost: ~$2.00
- Time: ~10 minutes
- Requests: Unlimited (within rate limits)

### Monthly Usage (1000 repos)

**Gemini Free Tier:**
- Cost: $0.00
- Limit: 1M tokens/month
- Sufficient for: ~500-1000 repos

**OpenAI Paid:**
- Cost: ~$20-30/month
- Limit: Based on payment
- Sufficient for: Unlimited repos

## Support & Resources

### Official Documentation
- [Google AI Studio](https://aistudio.google.com)
- [Gemini API Docs](https://ai.google.dev/docs)
- [Pricing](https://ai.google.dev/pricing)

### RepoMind Resources
- [Documentation Agent Guide](src/agents/DOCUMENTATION_AGENT_GUIDE.md)
- [Configuration Guide](src/lib/config.ts)
- [Gemini Service](src/services/gemini.service.ts)

### Getting Help
- Check application logs
- Review error messages
- Test with simple requests first
- Verify API key is valid

## Summary

✅ **Setup Complete When:**
1. Gemini API key added to `.env`
2. Application restarted
3. Logs show "Gemini service initialized"
4. AI Provider shows "gemini" in config status
5. Documentation generation works

🎉 **You're now using Google Gemini's free tier for AI-powered documentation generation!**

---

**Last Updated:** 2026-05-16  
**Version:** 1.0.0