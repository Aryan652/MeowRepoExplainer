# Documentation Agent - Complete Implementation Guide

## Overview

The Documentation Agent is a fully functional AI-powered system that generates comprehensive documentation for GitHub repositories. This guide explains how to use it and how it works.

## Features

The agent generates 4 types of documentation:

1. **README.md** - Project overview, features, installation, and usage
2. **API Reference** - Detailed API documentation for code files
3. **Onboarding Guide** - Setup instructions and getting started guide
4. **Architecture Documentation** - System architecture and design patterns

## How to Use

### For End Users

1. **Navigate to Repository Docs Page**
   - Go to `/repo/{repoId}/docs` in your application
   - You'll see 4 documentation sections in the sidebar

2. **Generate Documentation**
   - Click the "Generate Docs" button in the top-right corner
   - The system will start generating documentation asynchronously
   - You'll see a "⏳ Generating documentation..." message

3. **Monitor Progress**
   - The page automatically polls every 3 seconds for updates
   - A spinning icon shows generation is in progress
   - Generation typically takes 2-5 minutes depending on repository size

4. **View Results**
   - Once complete, documentation appears in markdown format
   - Switch between sections using the sidebar
   - Export documentation using the "Export .md" button

### For Developers

#### API Endpoints

**Generate Documentation**
```typescript
import { generateRepoDocs } from "@/lib/api/docs";

const result = await generateRepoDocs({ 
  data: { repoId: "your-repo-id" } 
});

// Returns:
// {
//   success: true,
//   message: "Documentation generation started",
//   jobId: "unique-job-id",
//   status: "started"
// }
```

**Get Documentation**
```typescript
import { getRepoDocs } from "@/lib/api/docs";

const docs = await getRepoDocs({ 
  data: { repoId: "your-repo-id" } 
});

// Returns array of:
// {
//   id: string,
//   docType: "readme" | "api" | "onboarding" | "architecture",
//   title: string,
//   content: string,
//   createdAt: Date
// }
```

**Check Generation Status**
```typescript
import { getDocsGenerationStatus } from "@/lib/api/docs";

const status = await getDocsGenerationStatus({ 
  data: { repoId: "your-repo-id" } 
});

// Returns:
// {
//   status: "not_started" | "generating" | "completed" | "error",
//   docs: Array<{ docType, title, hasContent }>
// }
```

## Architecture

### Components

1. **Documentation Agent** (`src/agents/documentation.agent.ts`)
   - Extends `BaseAgent`
   - Fetches repository data from GitHub
   - Uses OpenAI for AI-powered documentation generation
   - Processes files in batches to respect rate limits

2. **API Layer** (`src/lib/api/docs.ts`)
   - `generateRepoDocs`: Triggers async documentation generation
   - `getRepoDocs`: Retrieves generated documentation
   - `getDocsGenerationStatus`: Checks generation progress

3. **UI Component** (`src/routes/repo.$repoId.docs.tsx`)
   - Displays documentation with sidebar navigation
   - "Generate Docs" button to trigger generation
   - Auto-polling for real-time updates
   - Error handling and retry functionality

4. **Database Schema** (`src/db/schema.ts`)
   - `repository_docs` table stores generated documentation
   - Fields: id, repositoryId, docType, title, content, createdAt

### Flow Diagram

```
User clicks "Generate Docs"
    ↓
generateRepoDocs() API called
    ↓
Validate repository exists
    ↓
Check if generation in progress
    ↓
Create pending doc entries in DB
    ↓
Execute DocumentationAgent asynchronously
    ↓
Agent fetches repo data from GitHub
    ↓
Agent generates docs using OpenAI
    ↓
Update DB with generated content
    ↓
UI polls and displays results
```

## Configuration

### Required Environment Variables

```bash
# OpenAI API Key (required)
OPENAI_API_KEY=sk-...

# GitHub Token (optional but recommended)
GITHUB_TOKEN=ghp_...

# Database URL (required)
DATABASE_URL=postgresql://...
```

### Agent Configuration

The agent can be configured in `src/agents/documentation.agent.ts`:

```typescript
// Number of sample files to analyze
const sampleFiles = codeFiles.slice(0, 10); // Default: 10

// OpenAI model parameters
{
  temperature: 0.4,  // Creativity level (0-1)
  maxTokens: 2000    // Max response length
}

// Batch size for API docs
const batches = this.chunkArray(files, 3); // Default: 3 files per batch
```

## Error Handling

### Common Errors

1. **"Repository not found"**
   - Repository doesn't exist in database
   - Check repoId is correct

2. **"Documentation generation already in progress"**
   - Generation started within last 5 minutes
   - Wait for current generation to complete

3. **"OpenAI service is not configured"**
   - OPENAI_API_KEY not set
   - Add API key to environment variables

4. **"GitHub API error"**
   - Rate limit exceeded
   - Invalid repository URL
   - Private repository without token

### Retry Logic

The UI automatically handles retries:
- Failed generations show error message
- "Retry Generation" button appears
- Click to restart generation process

## Performance Considerations

### Rate Limits

1. **OpenAI API**
   - Agent processes files in batches of 3
   - 1-second delay between batches
   - Adjust batch size if hitting rate limits

2. **GitHub API**
   - 60 requests/hour without token
   - 5,000 requests/hour with token
   - Use GITHUB_TOKEN for better limits

### Optimization Tips

1. **Limit File Count**
   - Agent samples first 10 files by default
   - Increase for more comprehensive docs
   - Decrease for faster generation

2. **Async Processing**
   - Generation runs in background
   - User gets immediate response
   - Use job queue for production (e.g., Bull, BullMQ)

3. **Caching**
   - Generated docs stored in database
   - Regenerate only when needed
   - Consider TTL for auto-refresh

## Testing

### Manual Testing

1. **Test with Public Repository**
```typescript
// In browser console or test file
const result = await generateRepoDocs({ 
  data: { repoId: "test-repo-id" } 
});
console.log(result);
```

2. **Monitor Database**
```sql
-- Check pending docs
SELECT * FROM repository_docs 
WHERE content LIKE '%⏳ Generating%';

-- Check completed docs
SELECT doc_type, LENGTH(content) as content_length 
FROM repository_docs 
WHERE repository_id = 'your-repo-id';
```

3. **Check Logs**
```bash
# Look for agent execution logs
grep "Documentation" logs/app.log
```

### Integration Testing

```typescript
import { describe, it, expect } from "vitest";
import { generateRepoDocs } from "@/lib/api/docs";

describe("Documentation Generation", () => {
  it("should generate docs for valid repository", async () => {
    const result = await generateRepoDocs({ 
      data: { repoId: "valid-repo-id" } 
    });
    
    expect(result.success).toBe(true);
    expect(result.status).toBe("started");
  });

  it("should reject invalid repository", async () => {
    await expect(
      generateRepoDocs({ data: { repoId: "invalid" } })
    ).rejects.toThrow("Repository not found");
  });
});
```

## Troubleshooting

### Generation Stuck

If generation appears stuck:

1. Check database for pending docs:
```sql
SELECT * FROM repository_docs 
WHERE repository_id = 'your-repo-id' 
AND content LIKE '%⏳%';
```

2. Check application logs for errors

3. Manually delete pending docs and retry:
```sql
DELETE FROM repository_docs 
WHERE repository_id = 'your-repo-id';
```

### Poor Quality Documentation

If generated docs are low quality:

1. Increase sample file count in agent
2. Adjust OpenAI temperature (lower = more focused)
3. Provide better repository metadata
4. Ensure code files are properly formatted

### Slow Generation

If generation is too slow:

1. Reduce sample file count
2. Increase batch size (if not hitting rate limits)
3. Use faster OpenAI model (e.g., gpt-3.5-turbo)
4. Implement caching for repeated generations

## Future Enhancements

Potential improvements:

1. **Background Job Queue**
   - Use Bull/BullMQ for reliable async processing
   - Better error recovery and retries
   - Progress tracking

2. **Incremental Updates**
   - Only regenerate changed sections
   - Faster updates for large repositories

3. **Custom Templates**
   - User-defined documentation templates
   - Organization-specific formats

4. **Multi-language Support**
   - Generate docs in multiple languages
   - Automatic translation

5. **Version Control**
   - Track documentation versions
   - Diff between versions
   - Rollback capability

## Support

For issues or questions:
- Check logs in `logs/` directory
- Review error messages in UI
- Consult OpenAI API documentation
- Check GitHub API status

## License

This implementation is part of the RepoMind project.

---

**Last Updated**: 2026-05-16
**Version**: 1.0.0