/**
 * src/services/gemini.service.ts
 * 
 * Google Gemini API integration for AI-powered analysis.
 * Compatible interface with OpenAI service for easy migration.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "@/lib/config";
import { createLogger } from "@/lib/logger";

const logger = createLogger("GeminiService");

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

export class GeminiService {
  private client: GoogleGenerativeAI | null = null;
  private isConfigured: boolean;

  constructor() {
    const apiKey = process.env["GEMINI_API_KEY"] || process.env["GOOGLE_API_KEY"];
    this.isConfigured = !!apiKey;
    
    if (this.isConfigured && apiKey) {
      this.client = new GoogleGenerativeAI(apiKey);
      logger.info("Gemini service initialized");
    } else {
      logger.warn("Gemini API key not configured - AI features will be disabled");
    }
  }

  /**
   * Check if Gemini is configured
   */
  isAvailable(): boolean {
    return this.isConfigured && this.client !== null;
  }

  /**
   * Generate embeddings for text
   */
  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    if (!this.client) {
      throw new Error("Gemini client not configured");
    }

    try {
      logger.debug("Generating embedding", { textLength: text.length });

      const model = this.client.getGenerativeModel({ model: "text-embedding-004" });
      const result = await model.embedContent(text);
      
      const embedding = result.embedding.values;
      const tokens = this.estimateTokenCount(text);

      logger.debug("Embedding generated", { tokens, dimensions: embedding.length });

      return {
        embedding: Array.from(embedding),
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
      throw new Error("Gemini client not configured");
    }

    try {
      logger.info(`Generating embeddings for ${texts.length} texts`);

      const model = this.client.getGenerativeModel({ model: "text-embedding-004" });
      
      const results = await Promise.all(
        texts.map(async (text) => {
          const result = await model.embedContent(text);
          return {
            embedding: Array.from(result.embedding.values),
            tokens: this.estimateTokenCount(text),
          };
        })
      );

      logger.info(`Generated ${results.length} embeddings`);

      return results;
    } catch (error) {
      logger.error("Failed to generate embeddings batch", error);
      throw error;
    }
  }

  /**
   * Convert ChatMessage format to Gemini format
   */
  private convertMessages(messages: ChatMessage[]): { role: string; parts: { text: string }[] }[] {
    const geminiMessages: { role: string; parts: { text: string }[] }[] = [];
    let systemPrompt = "";

    for (const msg of messages) {
      if (msg.role === "system") {
        systemPrompt = msg.content;
      } else {
        geminiMessages.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        });
      }
    }

    // Prepend system prompt to first user message if exists
    if (systemPrompt && geminiMessages.length > 0 && geminiMessages[0].role === "user") {
      geminiMessages[0].parts[0].text = `${systemPrompt}\n\n${geminiMessages[0].parts[0].text}`;
    }

    return geminiMessages;
  }

  /**
   * Chat completion with Gemini
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
      throw new Error("Gemini client not configured");
    }

    try {
      const {
        model = "gemini-2.5-flash",
        temperature = 0.7,
        maxTokens = 2000,
      } = options;

      logger.debug("Chat completion request", {
        model,
        messageCount: messages.length,
      });

      const geminiModel = this.client.getGenerativeModel({
        model,
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
        },
      });

      const geminiMessages = this.convertMessages(messages);
      
      // Start chat with history (all messages except the last one)
      const history = geminiMessages.slice(0, -1);
      const lastMessage = geminiMessages[geminiMessages.length - 1];

      const chat = geminiModel.startChat({
        history,
      });

      const result = await chat.sendMessage(lastMessage.parts[0].text);
      const response = result.response;
      const content = response.text();

      // Estimate tokens (Gemini doesn't provide exact counts in free tier)
      const promptTokens = this.estimateTokenCount(
        messages.map((m) => m.content).join(" ")
      );
      const completionTokens = this.estimateTokenCount(content);

      const tokens = {
        prompt: promptTokens,
        completion: completionTokens,
        total: promptTokens + completionTokens,
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
      throw new Error("Gemini client not configured");
    }

    try {
      const {
        model = "gemini-2.5-flash",
        temperature = 0.7,
        maxTokens = 2000,
      } = options;

      logger.debug("Streaming chat completion request", {
        model,
        messageCount: messages.length,
      });

      const geminiModel = this.client.getGenerativeModel({
        model,
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
        },
      });

      const geminiMessages = this.convertMessages(messages);
      const history = geminiMessages.slice(0, -1);
      const lastMessage = geminiMessages[geminiMessages.length - 1];

      const chat = geminiModel.startChat({
        history,
      });

      const result = await chat.sendMessageStream(lastMessage.parts[0].text);

      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          yield text;
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
export const geminiService = new GeminiService();

// Made with Bob