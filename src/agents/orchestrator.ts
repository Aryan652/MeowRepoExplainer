/**
 * src/agents/orchestrator.ts
 * 
 * Agent Orchestrator - Coordinates execution of multiple AI agents.
 */

import { createLogger } from "@/lib/logger";
import { BaseAgent, AgentContext, AgentResult } from "./base.agent";
import { documentationAgent } from "./documentation.agent";
import { securityAgent } from "./security.agent";

const logger = createLogger("AgentOrchestrator");

export type AgentType = "documentation" | "security" | "refactor" | "testing" | "architecture";

export interface OrchestrationResult {
  success: boolean;
  results: Record<AgentType, AgentResult>;
  summary: {
    totalAgents: number;
    successfulAgents: number;
    failedAgents: number;
    totalProcessingTime: number;
  };
}

export class AgentOrchestrator {
  private agents: Map<AgentType, BaseAgent>;

  constructor() {
    this.agents = new Map();
    this.registerAgents();
  }

  /**
   * Register all available agents
   */
  private registerAgents(): void {
    this.agents.set("documentation", documentationAgent);
    this.agents.set("security", securityAgent);
    // TODO: Add other agents as they are implemented
    // this.agents.set("refactor", refactorAgent);
    // this.agents.set("testing", testingAgent);
    // this.agents.set("architecture", architectureAgent);

    logger.info(`Registered ${this.agents.size} agents`);
  }

  /**
   * Execute a single agent
   */
  async executeAgent(
    agentType: AgentType,
    context: AgentContext
  ): Promise<AgentResult> {
    const agent = this.agents.get(agentType);

    if (!agent) {
      logger.error(`Agent not found: ${agentType}`);
      return {
        success: false,
        error: `Agent ${agentType} is not registered`,
      };
    }

    logger.info(`Executing ${agentType} agent`, {
      repositoryId: context.repositoryId,
    });

    try {
      const result = await agent.execute(context);
      return result;
    } catch (error) {
      logger.error(`Agent ${agentType} execution failed`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Execute multiple agents in parallel
   */
  async executeAgents(
    agentTypes: AgentType[],
    context: AgentContext
  ): Promise<OrchestrationResult> {
    logger.info(`Orchestrating ${agentTypes.length} agents`, {
      agents: agentTypes,
      repositoryId: context.repositoryId,
    });

    const startTime = Date.now();
    const results: Record<string, AgentResult> = {};

    // Execute agents in parallel
    const agentPromises = agentTypes.map(async (agentType) => {
      const result = await this.executeAgent(agentType, context);
      return { agentType, result };
    });

    const agentResults = await Promise.all(agentPromises);

    // Collect results
    for (const { agentType, result } of agentResults) {
      results[agentType] = result;
    }

    const totalProcessingTime = Date.now() - startTime;

    // Calculate summary
    const successfulAgents = agentResults.filter((r) => r.result.success).length;
    const failedAgents = agentResults.length - successfulAgents;

    const summary = {
      totalAgents: agentTypes.length,
      successfulAgents,
      failedAgents,
      totalProcessingTime,
    };

    logger.info("Orchestration complete", summary);

    return {
      success: failedAgents === 0,
      results: results as Record<AgentType, AgentResult>,
      summary,
    };
  }

  /**
   * Execute all available agents
   */
  async executeAllAgents(context: AgentContext): Promise<OrchestrationResult> {
    const allAgentTypes = Array.from(this.agents.keys());
    return this.executeAgents(allAgentTypes, context);
  }

  /**
   * Get list of available agents
   */
  getAvailableAgents(): AgentType[] {
    return Array.from(this.agents.keys());
  }

  /**
   * Check if an agent is available
   */
  isAgentAvailable(agentType: AgentType): boolean {
    return this.agents.has(agentType);
  }

  /**
   * Execute agents based on analysis type
   */
  async executeByAnalysisType(
    analysisType: "full" | "quick" | "security-only" | "docs-only",
    context: AgentContext
  ): Promise<OrchestrationResult> {
    let agentTypes: AgentType[];

    switch (analysisType) {
      case "full":
        agentTypes = this.getAvailableAgents();
        break;
      case "quick":
        agentTypes = ["documentation", "security"];
        break;
      case "security-only":
        agentTypes = ["security"];
        break;
      case "docs-only":
        agentTypes = ["documentation"];
        break;
      default:
        agentTypes = this.getAvailableAgents();
    }

    logger.info(`Executing ${analysisType} analysis`, { agents: agentTypes });

    return this.executeAgents(agentTypes, context);
  }

  /**
   * Execute agents sequentially (for rate-limited scenarios)
   */
  async executeAgentsSequential(
    agentTypes: AgentType[],
    context: AgentContext,
    delayMs: number = 1000
  ): Promise<OrchestrationResult> {
    logger.info(`Orchestrating ${agentTypes.length} agents sequentially`, {
      agents: agentTypes,
      repositoryId: context.repositoryId,
    });

    const startTime = Date.now();
    const results: Record<string, AgentResult> = {};
    let successfulAgents = 0;
    let failedAgents = 0;

    for (const agentType of agentTypes) {
      const result = await this.executeAgent(agentType, context);
      results[agentType] = result;

      if (result.success) {
        successfulAgents++;
      } else {
        failedAgents++;
      }

      // Delay between agents
      if (agentType !== agentTypes[agentTypes.length - 1]) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    const totalProcessingTime = Date.now() - startTime;

    const summary = {
      totalAgents: agentTypes.length,
      successfulAgents,
      failedAgents,
      totalProcessingTime,
    };

    logger.info("Sequential orchestration complete", summary);

    return {
      success: failedAgents === 0,
      results: results as Record<AgentType, AgentResult>,
      summary,
    };
  }

  /**
   * Get agent execution status
   */
  getAgentStatus(agentType: AgentType): {
    available: boolean;
    name: string;
  } {
    const agent = this.agents.get(agentType);
    return {
      available: !!agent,
      name: agent?.getName() || agentType,
    };
  }

  /**
   * Get all agent statuses
   */
  getAllAgentStatuses(): Record<AgentType, { available: boolean; name: string }> {
    const statuses: any = {};
    
    for (const agentType of this.agents.keys()) {
      statuses[agentType] = this.getAgentStatus(agentType);
    }

    return statuses;
  }
}

// Export singleton instance
export const agentOrchestrator = new AgentOrchestrator();

// Made with Bob
