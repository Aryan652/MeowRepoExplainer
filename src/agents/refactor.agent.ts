/**
 * src/agents/refactor.agent.ts
 * 
 * Refactor Agent - Analyzes code for refactoring opportunities and code smells.
 */

import { BaseAgent, AgentContext, AgentResult } from "./base.agent";
import { openaiService } from "@/services/openai.service";
import { geminiService } from "@/services/gemini.service";
import { githubService } from "@/services/github.service";
import { config } from "@/lib/config";

export interface RefactorIssue {
  type: "code-smell" | "anti-pattern" | "complexity" | "duplication" | "unused";
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
  file: string;
  line?: number;
  suggestion: string;
  effort: "low" | "medium" | "high"; // Refactoring effort estimate
}

export interface RefactorResult {
  issues: RefactorIssue[];
  summary: {
    codeSmells: number;
    antiPatterns: number;
    complexityIssues: number;
    duplications: number;
    unusedCode: number;
    total: number;
  };
  maintainabilityScore: number; // 0-100, higher is better
}

export class RefactorAgent extends BaseAgent {
  // Code smell detection patterns
  private readonly CODE_PATTERNS = {
    longMethod: /function\s+\w+[^{]*{[\s\S]{1000,}?}/g,
    longClass: /class\s+\w+[^{]*{[\s\S]{3000,}?}/g,
    magicNumbers: /(?<![a-zA-Z_])[0-9]{2,}(?![a-zA-Z_0-9])/g,
    deepNesting: /\s{12,}/g, // 3+ levels of indentation
    longParameterList: /function\s+\w+\s*\([^)]{100,}\)/g,
    duplicateCode: /(.{50,})\1{2,}/g, // Repeated patterns
  };

  constructor() {
    super("Refactor");
  }

  async execute(context: AgentContext): Promise<AgentResult> {
    try {
      const { repositoryId, repositoryName, language } = context;

      this.logger.info(`Starting refactoring analysis`, {
        repositoryId,
        repositoryName,
        language,
      });

      // Parse GitHub URL
      const parsed = githubService.parseGitHubUrl(repositoryName);
      if (!parsed) {
        return {
          success: false,
          error: `Invalid repository name format: "${repositoryName}"`,
        };
      }

      const { owner, repo } = parsed;

      // Get repository files
      const tree = await githubService.getRepositoryTree(owner, repo);
      const codeFiles = githubService.getCodeFiles(tree);

      this.logger.info(`Analyzing ${codeFiles.length} files for refactoring opportunities`);

      // Get file contents (limit to avoid token limits)
      const filesToAnalyze = codeFiles.slice(0, 15);
      const fileContents = await githubService.getFilesBatch(
        owner,
        repo,
        filesToAnalyze.map((f) => f.path)
      );

      // Run both pattern-based and AI-based analysis
      const [patternIssues, aiIssues] = await Promise.all([
        this.analyzeWithPatterns(fileContents),
        this.analyzeWithAI(fileContents, language),
      ]);

      // Combine and deduplicate issues
      const allIssues = [...patternIssues, ...aiIssues];
      const uniqueIssues = this.deduplicateIssues(allIssues);

      // Calculate summary and score
      const summary = this.calculateSummary(uniqueIssues);
      const maintainabilityScore = this.calculateMaintainabilityScore(
        summary,
        fileContents.length
      );

      const result: RefactorResult = {
        issues: uniqueIssues,
        summary,
        maintainabilityScore,
      };

      return {
        success: true,
        data: result,
        metadata: {
          filesProcessed: fileContents.length,
        },
      };
    } catch (error) {
      this.logger.error("Refactoring analysis failed", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Analyze files using regex patterns
   */
  private async analyzeWithPatterns(files: any[]): Promise<RefactorIssue[]> {
    this.logger.debug("Running pattern-based refactoring analysis");

    const issues: RefactorIssue[] = [];

    for (const file of files) {
      const content = file.content;
      const lines = content.split("\n");

      // Check for long methods
      const longMethods = content.match(this.CODE_PATTERNS.longMethod);
      if (longMethods && longMethods.length > 0) {
        issues.push({
          type: "code-smell",
          severity: "medium",
          title: "Long Method Detected",
          description: `Method exceeds 50 lines. Consider breaking it into smaller, focused methods.`,
          file: file.path,
          suggestion: "Extract method: Break down into smaller, single-responsibility methods",
          effort: "medium",
        });
      }

      // Check for long classes
      const longClasses = content.match(this.CODE_PATTERNS.longClass);
      if (longClasses && longClasses.length > 0) {
        issues.push({
          type: "code-smell",
          severity: "high",
          title: "Large Class Detected",
          description: `Class exceeds 500 lines. This may indicate a God Object anti-pattern.`,
          file: file.path,
          suggestion: "Extract class: Split into multiple classes with single responsibilities",
          effort: "high",
        });
      }

      // Check for magic numbers
      const magicNumbers = content.match(this.CODE_PATTERNS.magicNumbers);
      if (magicNumbers && magicNumbers.length > 3) {
        issues.push({
          type: "code-smell",
          severity: "low",
          title: "Magic Numbers Found",
          description: `Found ${magicNumbers.length} numeric literals. Consider using named constants.`,
          file: file.path,
          suggestion: "Replace magic numbers with named constants for better readability",
          effort: "low",
        });
      }

      // Check for deep nesting
      const deepNesting = content.match(this.CODE_PATTERNS.deepNesting);
      if (deepNesting && deepNesting.length > 5) {
        issues.push({
          type: "complexity",
          severity: "medium",
          title: "Deep Nesting Detected",
          description: "Code has deep nesting levels (3+), making it hard to read and maintain.",
          file: file.path,
          suggestion: "Reduce nesting: Use early returns, extract methods, or guard clauses",
          effort: "medium",
        });
      }

      // Check for long parameter lists
      const longParams = content.match(this.CODE_PATTERNS.longParameterList);
      if (longParams && longParams.length > 0) {
        issues.push({
          type: "code-smell",
          severity: "medium",
          title: "Long Parameter List",
          description: "Function has too many parameters. Consider using parameter objects.",
          file: file.path,
          suggestion: "Introduce parameter object: Group related parameters into an object",
          effort: "low",
        });
      }

      // Check for potential code duplication
      const duplicates = content.match(this.CODE_PATTERNS.duplicateCode);
      if (duplicates && duplicates.length > 2) {
        issues.push({
          type: "duplication",
          severity: "medium",
          title: "Potential Code Duplication",
          description: "Detected repeated code patterns that could be extracted.",
          file: file.path,
          suggestion: "Extract method or create utility function to eliminate duplication",
          effort: "medium",
        });
      }

      // Check file length
      if (lines.length > 300) {
        issues.push({
          type: "code-smell",
          severity: "low",
          title: "Large File",
          description: `File has ${lines.length} lines. Consider splitting into smaller modules.`,
          file: file.path,
          suggestion: "Split file: Organize related functionality into separate modules",
          effort: "high",
        });
      }
    }

    return issues;
  }

  /**
   * Analyze files using AI
   */
  private async analyzeWithAI(files: any[], language: string): Promise<RefactorIssue[]> {
    this.logger.debug("Running AI-powered refactoring analysis");

    const issues: RefactorIssue[] = [];

    // Process files in batches
    const batches = this.chunkArray(files, 3);

    for (const batch of batches) {
      const batchIssues = await Promise.all(
        batch.map(async (file) => {
          try {
            const prompt = `Analyze this ${language} code for refactoring opportunities. Identify:
1. Code smells (long methods, large classes, etc.)
2. Anti-patterns
3. Complexity issues
4. Potential duplications
5. Unused or dead code

Code from ${file.path}:
\`\`\`${language}
${file.content.slice(0, 2000)}
\`\`\`

For each issue found, provide:
- Type (code-smell, anti-pattern, complexity, duplication, unused)
- Severity (high, medium, low)
- Title
- Description
- Specific suggestion for improvement
- Effort estimate (low, medium, high)

Format as a structured list.`;

            const aiService = config.isGeminiConfigured ? geminiService : openaiService;
            const result = await aiService.chatCompletion(
              [{ role: "user", content: prompt }],
              { temperature: 0.3, maxTokens: 1000 }
            );

            return this.parseAIRefactorResponse(result.content, file.path);
          } catch (error) {
            this.logger.warn(`AI analysis failed for ${file.path}`, { error });
            return [];
          }
        })
      );

      issues.push(...batchIssues.flat());

      // Delay between batches
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return issues;
  }

  /**
   * Parse AI refactoring response
   */
  private parseAIRefactorResponse(response: string, filePath: string): RefactorIssue[] {
    const issues: RefactorIssue[] = [];
    const lines = response.split("\n");

    let currentIssue: Partial<RefactorIssue> | null = null;

    for (const line of lines) {
      const lowerLine = line.toLowerCase();

      // Detect issue type
      if (lowerLine.includes("code-smell") || lowerLine.includes("code smell")) {
        if (currentIssue && currentIssue.title) issues.push(currentIssue as RefactorIssue);
        currentIssue = { type: "code-smell", file: filePath };
      } else if (lowerLine.includes("anti-pattern")) {
        if (currentIssue && currentIssue.title) issues.push(currentIssue as RefactorIssue);
        currentIssue = { type: "anti-pattern", file: filePath };
      } else if (lowerLine.includes("complexity")) {
        if (currentIssue && currentIssue.title) issues.push(currentIssue as RefactorIssue);
        currentIssue = { type: "complexity", file: filePath };
      } else if (lowerLine.includes("duplication") || lowerLine.includes("duplicate")) {
        if (currentIssue && currentIssue.title) issues.push(currentIssue as RefactorIssue);
        currentIssue = { type: "duplication", file: filePath };
      } else if (lowerLine.includes("unused") || lowerLine.includes("dead code")) {
        if (currentIssue && currentIssue.title) issues.push(currentIssue as RefactorIssue);
        currentIssue = { type: "unused", file: filePath };
      }

      if (currentIssue) {
        // Detect severity
        if (lowerLine.includes("high") && !currentIssue.severity) {
          currentIssue.severity = "high";
        } else if (lowerLine.includes("medium") && !currentIssue.severity) {
          currentIssue.severity = "medium";
        } else if (lowerLine.includes("low") && !currentIssue.severity) {
          currentIssue.severity = "low";
        }

        // Detect effort
        if (lowerLine.includes("effort")) {
          if (lowerLine.includes("high")) currentIssue.effort = "high";
          else if (lowerLine.includes("medium")) currentIssue.effort = "medium";
          else if (lowerLine.includes("low")) currentIssue.effort = "low";
        }

        // Extract content
        if (line.trim() && !currentIssue.title) {
          currentIssue.title = line.trim().slice(0, 100);
        } else if (line.trim() && !currentIssue.description && currentIssue.title) {
          currentIssue.description = line.trim();
        } else if (line.trim() && lowerLine.includes("suggest") && !currentIssue.suggestion) {
          currentIssue.suggestion = line.trim();
        }
      }
    }

    if (currentIssue && currentIssue.title) {
      // Set defaults if missing
      if (!currentIssue.severity) currentIssue.severity = "medium";
      if (!currentIssue.effort) currentIssue.effort = "medium";
      if (!currentIssue.description) currentIssue.description = currentIssue.title;
      if (!currentIssue.suggestion) currentIssue.suggestion = "Review and refactor this code";
      
      issues.push(currentIssue as RefactorIssue);
    }

    return issues;
  }

  /**
   * Deduplicate similar issues
   */
  private deduplicateIssues(issues: RefactorIssue[]): RefactorIssue[] {
    const seen = new Set<string>();
    const unique: RefactorIssue[] = [];

    for (const issue of issues) {
      const key = `${issue.file}:${issue.type}:${issue.title}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(issue);
      }
    }

    return unique;
  }

  /**
   * Calculate summary statistics
   */
  private calculateSummary(issues: RefactorIssue[]) {
    const summary = {
      codeSmells: 0,
      antiPatterns: 0,
      complexityIssues: 0,
      duplications: 0,
      unusedCode: 0,
      total: issues.length,
    };

    for (const issue of issues) {
      switch (issue.type) {
        case "code-smell":
          summary.codeSmells++;
          break;
        case "anti-pattern":
          summary.antiPatterns++;
          break;
        case "complexity":
          summary.complexityIssues++;
          break;
        case "duplication":
          summary.duplications++;
          break;
        case "unused":
          summary.unusedCode++;
          break;
      }
    }

    return summary;
  }

  /**
   * Calculate maintainability score (0-100)
   */
  private calculateMaintainabilityScore(summary: any, filesScanned: number): number {
    let score = 100;

    // Deduct points based on issue severity and type
    const issueWeights = {
      codeSmells: 3,
      antiPatterns: 5,
      complexityIssues: 4,
      duplications: 3,
      unusedCode: 2,
    };

    for (const [key, weight] of Object.entries(issueWeights)) {
      score -= summary[key] * weight;
    }

    // Normalize by number of files
    const issuesPerFile = summary.total / filesScanned;
    if (issuesPerFile > 5) score -= 10;
    else if (issuesPerFile > 3) score -= 5;

    return Math.max(0, Math.min(100, score));
  }
}

// Export singleton instance
export const refactorAgent = new RefactorAgent();

// Made with Bob