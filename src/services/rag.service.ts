/**
 * src/services/rag.service.ts
 * 
 * RAG (Retrieval-Augmented Generation) Service
 * Combines vector search with LLM generation for intelligent code Q&A.
 */

import { createLogger } from "@/lib/logger";
import { vectorService, SearchResult } from "./vector.service";
import { openaiService, ChatMessage } from "./openai.service";

const logger = createLogger("RAGService");

export interface RAGQuery {
  question: string;
  repositoryId: string;
  conversationHistory?: ChatMessage[];
  options?: {
    maxContext?: number;
    temperature?: number;
    stream?: boolean;
  };
}

export interface RAGResponse {
  answer: string;
  sources: Array<{
    filePath: string;
    content: string;
    similarity: number;
    startLine?: number;
    endLine?: number;
  }>;
  metadata: {
    tokensUsed?: number;
    retrievalTime: number;
    generationTime: number;
    totalTime: number;
  };
}

export class RAGService {
  constructor() {
    if (!vectorService.isAvailable()) {
      logger.warn("Vector service not available - RAG will be limited");
    }
    if (!openaiService.isAvailable()) {
      logger.warn("OpenAI service not available - RAG will not work");
    }
  }

  /**
   * Check if RAG service is available
   */
  isAvailable(): boolean {
    return vectorService.isAvailable() && openaiService.isAvailable();
  }

  /**
   * Answer a question using RAG
   */
  async query(ragQuery: RAGQuery): Promise<RAGResponse> {
    if (!this.isAvailable()) {
      throw new Error("RAG service is not available");
    }

    const startTime = Date.now();
    const {
      question,
      repositoryId,
      conversationHistory = [],
      options = {},
    } = ragQuery;

    const {
      maxContext = 5,
      temperature = 0.5,
    } = options;

    logger.info("Processing RAG query", {
      repositoryId,
      questionLength: question.length,
      historyLength: conversationHistory.length,
    });

    // Step 1: Retrieve relevant context
    const retrievalStart = Date.now();
    const searchResults = await this.retrieveContext(
      question,
      repositoryId,
      maxContext
    );
    const retrievalTime = Date.now() - retrievalStart;

    logger.debug(`Retrieved ${searchResults.length} relevant chunks`, {
      retrievalTime,
    });

    // Step 2: Prepare context for LLM
    const context = this.prepareContext(searchResults);

    // Step 3: Generate answer
    const generationStart = Date.now();
    const answer = await this.generateAnswer(
      question,
      context,
      conversationHistory,
      temperature
    );
    const generationTime = Date.now() - generationStart;

    const totalTime = Date.now() - startTime;

    // Step 4: Format response
    const response: RAGResponse = {
      answer,
      sources: searchResults.map((result) => ({
        filePath: result.chunk.filePath,
        content: result.chunk.content,
        similarity: result.similarity,
        startLine: result.chunk.startLine,
        endLine: result.chunk.endLine,
      })),
      metadata: {
        retrievalTime,
        generationTime,
        totalTime,
      },
    };

    logger.info("RAG query completed", response.metadata);

    return response;
  }

  /**
   * Stream answer using RAG
   */
  async *queryStream(ragQuery: RAGQuery): AsyncGenerator<string, void, unknown> {
    if (!this.isAvailable()) {
      throw new Error("RAG service is not available");
    }

    const {
      question,
      repositoryId,
      conversationHistory = [],
      options = {},
    } = ragQuery;

    const {
      maxContext = 5,
      temperature = 0.5,
    } = options;

    logger.info("Processing streaming RAG query", {
      repositoryId,
      questionLength: question.length,
    });

    // Retrieve context
    const searchResults = await this.retrieveContext(
      question,
      repositoryId,
      maxContext
    );

    const context = this.prepareContext(searchResults);

    // Stream answer
    const messages = this.buildMessages(question, context, conversationHistory);

    for await (const chunk of openaiService.chatCompletionStream(messages, {
      temperature,
    })) {
      yield chunk;
    }
  }

  /**
   * Retrieve relevant context from vector database
   */
  private async retrieveContext(
    question: string,
    repositoryId: string,
    maxResults: number
  ): Promise<SearchResult[]> {
    try {
      // Use hybrid search for better results
      const results = await vectorService.hybridSearch(question, repositoryId, {
        limit: maxResults,
        vectorWeight: 0.7,
        keywordWeight: 0.3,
      });

      return results;
    } catch (error) {
      logger.error("Context retrieval failed", error);
      // Fallback to empty context
      return [];
    }
  }

  /**
   * Prepare context string from search results
   */
  private prepareContext(searchResults: SearchResult[]): string {
    if (searchResults.length === 0) {
      return "No relevant code found in the repository.";
    }

    const contextParts = searchResults.map((result, index) => {
      const { filePath, content, startLine, endLine } = result.chunk;
      const location = startLine && endLine
        ? ` (lines ${startLine}-${endLine})`
        : "";

      return `
[Source ${index + 1}] ${filePath}${location}
Relevance: ${(result.similarity * 100).toFixed(1)}%

\`\`\`
${content}
\`\`\`
`;
    });

    return contextParts.join("\n---\n");
  }

  /**
   * Generate answer using LLM
   */
  private async generateAnswer(
    question: string,
    context: string,
    conversationHistory: ChatMessage[],
    temperature: number
  ): Promise<string> {
    const messages = this.buildMessages(question, context, conversationHistory);

    const result = await openaiService.chatCompletion(messages, {
      temperature,
      maxTokens: 1500,
    });

    return result.content;
  }

  /**
   * Build messages for LLM
   */
  private buildMessages(
    question: string,
    context: string,
    conversationHistory: ChatMessage[]
  ): ChatMessage[] {
    const systemMessage: ChatMessage = {
      role: "system",
      content: `You are an expert code assistant helping developers understand their codebase.

Your task is to answer questions about the code using the provided context from the repository.

Guidelines:
- Be specific and cite file paths when relevant
- Provide code examples when helpful
- If the context doesn't contain enough information, say so clearly
- Keep answers concise but complete
- Use markdown formatting for code blocks
- Reference line numbers when available
- Explain complex concepts in simple terms

When citing sources, use this format: "In \`path/to/file.ts\` (lines X-Y), ..."`,
    };

    const userMessage: ChatMessage = {
      role: "user",
      content: `Context from the codebase:

${context}

---

Question: ${question}

Please answer the question based on the provided context. If you reference specific code, cite the file path and line numbers.`,
    };

    return [systemMessage, ...conversationHistory, userMessage];
  }

  /**
   * Suggest follow-up questions based on the answer
   */
  async suggestFollowUpQuestions(
    question: string,
    answer: string,
    repositoryId: string
  ): Promise<string[]> {
    try {
      const prompt = `Based on this Q&A about a codebase, suggest 3 relevant follow-up questions:

Question: ${question}
Answer: ${answer}

Suggest 3 follow-up questions that would help the user understand the codebase better. Format as a numbered list.`;

      const result = await openaiService.chatCompletion(
        [{ role: "user", content: prompt }],
        { temperature: 0.7, maxTokens: 200 }
      );

      // Parse numbered list
      const questions = result.content
        .split("\n")
        .filter((line) => /^\d+\./.test(line.trim()))
        .map((line) => line.replace(/^\d+\.\s*/, "").trim())
        .slice(0, 3);

      return questions;
    } catch (error) {
      logger.error("Failed to generate follow-up questions", error);
      return [];
    }
  }

  /**
   * Explain a specific code snippet
   */
  async explainCode(
    code: string,
    filePath: string,
    language: string,
    repositoryId: string
  ): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: "system",
        content: `You are an expert code explainer. Explain code clearly and concisely.`,
      },
      {
        role: "user",
        content: `Explain this ${language} code from \`${filePath}\`:

\`\`\`${language}
${code}
\`\`\`

Provide:
1. What the code does
2. Key concepts or patterns used
3. Any potential issues or improvements`,
      },
    ];

    const result = await openaiService.chatCompletion(messages, {
      temperature: 0.4,
      maxTokens: 1000,
    });

    return result.content;
  }

  /**
   * Find similar code patterns in the repository
   */
  async findSimilarCode(
    code: string,
    repositoryId: string,
    limit: number = 5
  ): Promise<SearchResult[]> {
    if (!vectorService.isAvailable()) {
      throw new Error("Vector service is not available");
    }

    logger.debug("Finding similar code patterns", {
      repositoryId,
      codeLength: code.length,
    });

    const results = await vectorService.searchSimilar(
      code,
      repositoryId,
      limit,
      0.6 // Lower threshold for code similarity
    );

    return results;
  }

  /**
   * Summarize a file or code section
   */
  async summarizeCode(
    code: string,
    filePath: string,
    language: string
  ): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: "system",
        content: `You are an expert at summarizing code. Provide concise, accurate summaries.`,
      },
      {
        role: "user",
        content: `Summarize this ${language} code from \`${filePath}\`:

\`\`\`${language}
${code}
\`\`\`

Provide a brief summary (2-3 sentences) of what this code does and its main purpose.`,
      },
    ];

    const result = await openaiService.chatCompletion(messages, {
      temperature: 0.3,
      maxTokens: 200,
    });

    return result.content;
  }

  /**
   * Generate code examples based on a description
   */
  async generateCodeExample(
    description: string,
    language: string,
    repositoryId: string
  ): Promise<string> {
    // Get similar code for context
    const similarCode = await this.retrieveContext(description, repositoryId, 3);
    const context = this.prepareContext(similarCode);

    const messages: ChatMessage[] = [
      {
        role: "system",
        content: `You are an expert ${language} developer. Generate code examples that match the style and patterns of the provided codebase.`,
      },
      {
        role: "user",
        content: `Based on the codebase context below, generate a ${language} code example for: ${description}

Context from codebase:
${context}

Generate clean, well-commented code that follows the patterns shown in the context.`,
      },
    ];

    const result = await openaiService.chatCompletion(messages, {
      temperature: 0.6,
      maxTokens: 1000,
    });

    return result.content;
  }
}

// Export singleton instance
export const ragService = new RAGService();

// Made with Bob
