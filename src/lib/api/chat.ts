/**
 * src/lib/api/chat.ts
 *
 * Server functions for chat/RAG functionality.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { config } from "@/lib/config";
import { createLogger } from "@/lib/logger";

const logger = createLogger("ChatAPI");

export const sendChatMessage = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      repositoryId: z.string(),
      message: z.string(),
      conversationHistory: z
        .array(
          z.object({
            role: z.enum(["system", "user", "assistant"]),
            content: z.string(),
          })
        )
        .optional(),
    })
  )
  .handler(async ({ data }) => {
    logger.info("Processing chat message", {
      repositoryId: data.repositoryId,
      messageLength: data.message.length,
    });

    // Check if RAG service is available
    if (!config.isOpenAIConfigured || !config.isDatabaseConfigured) {
      logger.warn("RAG service not available - returning mock response");
      return {
        success: false,
        error: "AI services not configured. Please add OPENAI_API_KEY and DATABASE_URL to your .env file.",
      };
    }

    try {
      const { ragService } = await import("@/services/rag.service");

      if (!ragService.isAvailable()) {
        return {
          success: false,
          error: "RAG service is not available. Please configure OpenAI API key and database.",
        };
      }

      const response = await ragService.query({
        question: data.message,
        repositoryId: data.repositoryId,
        conversationHistory: data.conversationHistory,
      });

      logger.info("Chat response generated", {
        sourcesCount: response.sources.length,
        processingTime: response.metadata.totalTime,
      });

      return {
        success: true,
        data: {
          answer: response.answer,
          sources: response.sources,
          metadata: response.metadata,
        },
      };
    } catch (error) {
      logger.error("Chat message processing failed", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to process message",
      };
    }
  });

export const explainCode = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      repositoryId: z.string(),
      code: z.string(),
      filePath: z.string(),
      language: z.string(),
    })
  )
  .handler(async ({ data }) => {
    logger.info("Explaining code", {
      repositoryId: data.repositoryId,
      filePath: data.filePath,
    });

    if (!config.isOpenAIConfigured) {
      return {
        success: false,
        error: "OpenAI not configured",
      };
    }

    try {
      const { ragService } = await import("@/services/rag.service");

      const explanation = await ragService.explainCode(
        data.code,
        data.filePath,
        data.language,
        data.repositoryId
      );

      return {
        success: true,
        data: { explanation },
      };
    } catch (error) {
      logger.error("Code explanation failed", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to explain code",
      };
    }
  });

export const findSimilarCode = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      repositoryId: z.string(),
      code: z.string(),
      limit: z.number().optional(),
    })
  )
  .handler(async ({ data }) => {
    logger.info("Finding similar code", {
      repositoryId: data.repositoryId,
      codeLength: data.code.length,
    });

    if (!config.isOpenAIConfigured || !config.isDatabaseConfigured) {
      return {
        success: false,
        error: "Services not configured",
      };
    }

    try {
      const { ragService } = await import("@/services/rag.service");

      const results = await ragService.findSimilarCode(
        data.code,
        data.repositoryId,
        data.limit || 5
      );

      return {
        success: true,
        data: {
          results: results.map((r) => ({
            filePath: r.chunk.filePath,
            content: r.chunk.content,
            similarity: r.similarity,
            startLine: r.chunk.startLine,
            endLine: r.chunk.endLine,
          })),
        },
      };
    } catch (error) {
      logger.error("Similar code search failed", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to find similar code",
      };
    }
  });

export const generateCodeExample = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      repositoryId: z.string(),
      description: z.string(),
      language: z.string(),
    })
  )
  .handler(async ({ data }) => {
    logger.info("Generating code example", {
      repositoryId: data.repositoryId,
      language: data.language,
    });

    if (!config.isOpenAIConfigured) {
      return {
        success: false,
        error: "OpenAI not configured",
      };
    }

    try {
      const { ragService } = await import("@/services/rag.service");

      const example = await ragService.generateCodeExample(
        data.description,
        data.language,
        data.repositoryId
      );

      return {
        success: true,
        data: { example },
      };
    } catch (error) {
      logger.error("Code example generation failed", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate example",
      };
    }
  });

// Made with Bob
