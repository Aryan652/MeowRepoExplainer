/**
 * src/services/openai.service.ts
 * 
 * OpenAI API integration for embeddings and AI-powered analysis.
 */

import OpenAI from "openai";
import { config } from "@/lib/config";
import { createLogger } from "@/lib/logger";

const logger = createLogger("OpenAIService");

export interface EmbeddingResult {
  embedding: number[];
  tokens: number;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionResult {
  content: string;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
}

export class OpenAIService {
  private client: OpenAI | null = null;
  private isConfigured: boolean;

  constructor() {
    this.isConfigured = config.isOpenAIConfigured;
    
    if (this.isConfigured && config.openaiApiKey) {
      this.client = new OpenAI({
        apiKey: config.openaiApiKey,
      });
      logger.info("OpenAI service initialized");
    } else {
      logger.warn("OpenAI API key not configured - AI features will be disabled");
    }
  }

  /**
   * Check if OpenAI is configured
   */
  isAvailable(): boolean {
    return this.isConfigured && this.client !== null;
  }

  /**
   * Generate embeddings for text
   */
  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    if (!this.client) {
      throw new Error("OpenAI client not configured");
    }

    try {
      logger.debug("Generating embedding", { textLength: text.length });

      const response = await this.client.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
        encoding_format: "float",
      });

      const embedding = response.data[0].embedding;
      const tokens = response.usage.total_tokens;

      logger.debug("Embedding generated", { tokens, dimensions: embedding.length });

      return {
        embedding,
        tokens,
      };
    } catch (error) {
      logger.error("Failed to generate embedding", error);
      throw error;
    }
  }

  /**
   * Generate embeddings for multiple texts in batch
   */
  async generateEmbeddingsBatch(texts: string[]): Promise<EmbeddingResult[]> {
    if (!this.client) {
      throw new Error("OpenAI client not configured");
    }

    try {
      logger.info(`Generating embeddings for ${texts.length} texts`);

      const response = await this.client.embeddings.create({
        model: "text-embedding-3-small",
        input: texts,
        encoding_format: "float",
      });

      const results = response.data.map((item) => ({
        embedding: item.embedding,
        tokens: 0, // Individual token count not available in batch
      }));

      logger.info(`Generated ${results.length} embeddings`, {
        totalTokens: response.usage.total_tokens,
      });

      return results;
    } catch (error) {
      logger.error("Failed to generate embeddings batch", error);
      throw error;
    }
  }

  /**
   * Chat completion with GPT-4
   */
  async chatCompletion(
    messages: ChatMessage[],
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      stream?: boolean;
    } = {}
  ): Promise<ChatCompletionResult> {
    if (!this.client) {
      throw new Error("OpenAI client not configured");
    }

    try {
      const {
        model = "gpt-4-turbo-preview",
        temperature = 0.7,
        maxTokens = 2000,
      } = options;

      logger.debug("Chat completion request", {
        model,
        messageCount: messages.length,
      });

      const response = await this.client.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      });

      const content = response.choices[0].message.content || "";
      const tokens = {
        prompt: response.usage?.prompt_tokens || 0,
        completion: response.usage?.completion_tokens || 0,
        total: response.usage?.total_tokens || 0,
      };

      logger.debug("Chat completion response", { tokens });

      return {
        content,
        tokens,
      };
    } catch (error) {
      logger.error("Failed to generate chat completion", error);
      throw error;
    }
  }

  /**
   * Streaming chat completion
   */
  async *chatCompletionStream(
    messages: ChatMessage[],
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    } = {}
  ): AsyncGenerator<string, void, unknown> {
    if (!this.client) {
      throw new Error("OpenAI client not configured");
    }

    try {
      const {
        model = "gpt-4-turbo-preview",
        temperature = 0.7,
        maxTokens = 2000,
      } = options;

      logger.debug("Streaming chat completion request", {
        model,
        messageCount: messages.length,
      });

      const stream = await this.client.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }

      logger.debug("Streaming chat completion completed");
    } catch (error) {
      logger.error("Failed to stream chat completion", error);
      throw error;
    }
  }

  /**
   * Generate code documentation
   */
  async generateDocumentation(code: string, language: string): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: "system",
        content: `You are an expert technical writer. Generate clear, concise documentation for the provided ${language} code. Include:
- Brief description of what the code does
- Parameters and return values
- Usage examples
- Important notes or caveats`,
      },
      {
        role: "user",
        content: `Generate documentation for this ${language} code:\n\n${code}`,
      },
    ];

    const result = await this.chatCompletion(messages, {
      temperature: 0.3,
      maxTokens: 1000,
    });

    return result.content;
  }

  /**
   * Analyze code for security issues
   */
  async analyzeSecurityIssues(code: string, language: string): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: "system",
        content: `You are a security expert. Analyze the provided ${language} code for security vulnerabilities, including:
- SQL injection risks
- XSS vulnerabilities
- Authentication/authorization issues
- Hardcoded secrets
- Unsafe dependencies
- Input validation problems
Provide specific line numbers and remediation suggestions.`,
      },
      {
        role: "user",
        content: `Analyze this ${language} code for security issues:\n\n${code}`,
      },
    ];

    const result = await this.chatCompletion(messages, {
      temperature: 0.2,
      maxTokens: 1500,
    });

    return result.content;
  }

  /**
   * Suggest code refactoring
   */
  async suggestRefactoring(code: string, language: string): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: "system",
        content: `You are a senior software engineer. Analyze the provided ${language} code and suggest refactoring improvements:
- Code smells and anti-patterns
- Complexity reduction
- Better naming conventions
- Design pattern opportunities
- Performance optimizations
Provide specific, actionable suggestions with code examples.`,
      },
      {
        role: "user",
        content: `Suggest refactoring improvements for this ${language} code:\n\n${code}`,
      },
    ];

    const result = await this.chatCompletion(messages, {
      temperature: 0.4,
      maxTokens: 1500,
    });

    return result.content;
  }

  /**
   * Generate test cases
   */
  async generateTestCases(code: string, language: string): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: "system",
        content: `You are a testing expert. Generate comprehensive test cases for the provided ${language} code:
- Unit tests for all functions
- Edge cases and boundary conditions
- Error handling tests
- Integration test suggestions
Use appropriate testing framework for ${language}.`,
      },
      {
        role: "user",
        content: `Generate test cases for this ${language} code:\n\n${code}`,
      },
    ];

    const result = await this.chatCompletion(messages, {
      temperature: 0.3,
      maxTokens: 2000,
    });

    return result.content;
  }

  /**
   * Answer code-related questions using RAG context
   */
  async answerCodeQuestion(
    question: string,
    context: string[],
    conversationHistory: ChatMessage[] = []
  ): Promise<string> {
    const contextText = context.join("\n\n---\n\n");

    const messages: ChatMessage[] = [
      {
        role: "system",
        content: `You are an expert code assistant. Answer questions about the codebase using the provided context. 
- Be specific and cite file paths when relevant
- Provide code examples when helpful
- If the context doesn't contain enough information, say so
- Keep answers concise but complete`,
      },
      ...conversationHistory,
      {
        role: "user",
        content: `Context from codebase:\n\n${contextText}\n\nQuestion: ${question}`,
      },
    ];

    const result = await this.chatCompletion(messages, {
      temperature: 0.5,
      maxTokens: 1500,
    });

    return result.content;
  }

  /**
   * Calculate token count for text (approximate)
   */
  estimateTokenCount(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Chunk text to fit within token limits
   */
  chunkText(text: string, maxTokens: number = 8000): string[] {
    const maxChars = maxTokens * 4; // Approximate
    const chunks: string[] = [];
    
    let start = 0;
    while (start < text.length) {
      const end = Math.min(start + maxChars, text.length);
      chunks.push(text.slice(start, end));
      start = end;
    }
    
    return chunks;
  }
}

// Export singleton instance
export const openaiService = new OpenAIService();

// Made with Bob
