/**
 * src/agents/base.agent.ts
 * 
 * Base class for all AI agents with common functionality.
 */

import { createLogger, Logger } from "@/lib/logger";
import { openaiService } from "@/services/openai.service";
import { geminiService } from "@/services/gemini.service";
import { config } from "@/lib/config";

export interface AgentContext {
  repositoryId: string;
  repositoryName: string;
  language: string;
  files?: string[];
  metadata?: Record<string, unknown>;
}

export interface AgentResult {
  success: boolean;
  data?: unknown;
  error?: string;
  metadata?: {
    tokensUsed?: number;
    processingTime?: number;
    filesProcessed?: number;
  };
}

export abstract class BaseAgent {
  protected logger: Logger;
  protected name: string;

  constructor(name: string) {
    this.name = name;
    this.logger = createLogger(`Agent:${name}`);
  }

  /**
   * Execute the agent's main task
   */
  abstract execute(context: AgentContext): Promise<AgentResult>;

  /**
   * Validate that the agent can run
   */
  protected validatePrerequisites(): void {
    // Check if either AI service is available
    const hasAI = geminiService.isAvailable() || openaiService.isAvailable();
    if (!hasAI) {
      throw new Error("No AI service is configured. Please set GEMINI_API_KEY or OPENAI_API_KEY");
    }
  }

  /**
   * Log agent execution start
   */
  protected logStart(context: AgentContext): void {
    this.logger.info(`Starting ${this.name} agent`, {
      repositoryId: context.repositoryId,
      language: context.language,
    });
  }

  /**
   * Log agent execution completion
   */
  protected logComplete(result: AgentResult): void {
    if (result.success) {
      this.logger.info(`${this.name} agent completed successfully`, result.metadata);
    } else {
      this.logger.error(`${this.name} agent failed`, new Error(result.error));
    }
  }

  /**
   * Measure execution time
   */
  protected async measureTime<T>(fn: () => Promise<T>): Promise<{ result: T; time: number }> {
    const start = Date.now();
    const result = await fn();
    const time = Date.now() - start;
    return { result, time };
  }

  /**
   * Chunk large arrays for batch processing
   */
  protected chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Safe execution wrapper with error handling
   */
  protected async safeExecute(context: AgentContext): Promise<AgentResult> {
    try {
      this.validatePrerequisites();
      this.logStart(context);

      const { result, time } = await this.measureTime(() => this.execute(context));

      result.metadata = {
        ...result.metadata,
        processingTime: time,
      };

      this.logComplete(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`${this.name} agent execution failed`, error);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Get agent name
   */
  getName(): string {
    return this.name;
  }
}

// Made with Bob
