/**
 * src/lib/api/agents.ts
 * 
 * TanStack Start server functions for agent orchestration
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { agentOrchestrator, AgentType } from "@/agents/orchestrator";
import { AgentContext } from "@/agents/base.agent";
import { createLogger } from "@/lib/logger";

const logger = createLogger("AgentsAPI");

// ─── Request Validation Schemas ────────────────────────────────────────────────

const executeAgentsSchema = z.object({
  repositoryId: z.string(),
  repositoryName: z.string(),
  language: z.string(),
  agents: z.array(z.enum(["documentation", "security", "refactor", "testing", "architecture"])),
  mode: z.enum(["parallel", "sequential"]).optional().default("parallel"),
  delayMs: z.number().optional().default(1000),
});

const analyzeSchema = z.object({
  repositoryId: z.string(),
  repositoryName: z.string(),
  language: z.string(),
  analysisType: z.enum(["full", "quick", "security-only", "docs-only"]),
});

const agentStatusSchema = z.object({
  agentType: z.enum(["documentation", "security", "refactor", "testing", "architecture"]),
});

// ─── Server Functions ──────────────────────────────────────────────────────────

/**
 * Execute specific agents
 */
export const executeAgents = createServerFn({ method: "POST" })
  .inputValidator(executeAgentsSchema)
  .handler(async ({ data }) => {
    logger.info("Executing agents", {
      repositoryId: data.repositoryId,
      agents: data.agents,
      mode: data.mode,
    });

    try {
      const context: AgentContext = {
        repositoryId: data.repositoryId,
        repositoryName: data.repositoryName,
        language: data.language,
      };

      let result;
      if (data.mode === "sequential") {
        result = await agentOrchestrator.executeAgentsSequential(
          data.agents as AgentType[],
          context,
          data.delayMs
        );
      } else {
        result = await agentOrchestrator.executeAgents(
          data.agents as AgentType[],
          context
        );
      }

      logger.info("Agent execution complete", {
        success: result.success,
        totalAgents: result.summary.totalAgents,
        successfulAgents: result.summary.successfulAgents,
        failedAgents: result.summary.failedAgents,
      });

      return result;
    } catch (error) {
      logger.error("Agent execution failed", error);
      throw error;
    }
  });

/**
 * Execute agents by analysis type
 */
export const analyzeRepository = createServerFn({ method: "POST" })
  .inputValidator(analyzeSchema)
  .handler(async ({ data }) => {
    logger.info("Starting repository analysis", {
      repositoryId: data.repositoryId,
      analysisType: data.analysisType,
    });

    try {
      const context: AgentContext = {
        repositoryId: data.repositoryId,
        repositoryName: data.repositoryName,
        language: data.language,
      };

      const result = await agentOrchestrator.executeByAnalysisType(
        data.analysisType,
        context
      );

      logger.info("Analysis complete", {
        success: result.success,
        analysisType: data.analysisType,
        totalAgents: result.summary.totalAgents,
      });

      return result;
    } catch (error) {
      logger.error("Analysis failed", error);
      throw error;
    }
  });

/**
 * Get status of all agents
 */
export const getAgentsStatus = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const agents = agentOrchestrator.getAllAgentStatuses();
    const availableAgents = agentOrchestrator.getAvailableAgents();

    return {
      success: true,
      agents,
      availableAgents,
      totalAgents: availableAgents.length,
    };
  } catch (error) {
    logger.error("Failed to get agent status", error);
    throw error;
  }
});

/**
 * Get status of a specific agent
 */
export const getAgentStatus = createServerFn({ method: "GET" })
  .inputValidator(agentStatusSchema)
  .handler(async ({ data }) => {
    try {
      const status = agentOrchestrator.getAgentStatus(data.agentType as AgentType);

      return {
        success: true,
        agentType: data.agentType,
        ...status,
      };
    } catch (error) {
      logger.error(`Failed to get status for agent: ${data.agentType}`, error);
      throw error;
    }
  });

/**
 * Execute a single agent
 */
export const executeSingleAgent = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      repositoryId: z.string(),
      repositoryName: z.string(),
      language: z.string(),
      agentType: z.enum(["documentation", "security", "refactor", "testing", "architecture"]),
    })
  )
  .handler(async ({ data }) => {
    logger.info(`Executing ${data.agentType} agent`, {
      repositoryId: data.repositoryId,
    });

    try {
      const context: AgentContext = {
        repositoryId: data.repositoryId,
        repositoryName: data.repositoryName,
        language: data.language,
      };

      const result = await agentOrchestrator.executeAgent(
        data.agentType as AgentType,
        context
      );

      logger.info(`${data.agentType} agent execution complete`, {
        success: result.success,
      });

      return result;
    } catch (error) {
      logger.error(`${data.agentType} agent execution failed`, error);
      throw error;
    }
  });

// Made with Bob