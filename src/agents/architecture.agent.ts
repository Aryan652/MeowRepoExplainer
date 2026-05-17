/**
 * src/agents/architecture.agent.ts
 * 
 * Architecture Agent - Analyzes project architecture and design patterns.
 */

import { BaseAgent, AgentContext, AgentResult } from "./base.agent";
import { openaiService } from "@/services/openai.service";
import { geminiService } from "@/services/gemini.service";
import { githubService } from "@/services/github.service";
import { config } from "@/lib/config";

export interface ArchitectureIssue {
  type: "coupling" | "cohesion" | "layering" | "dependency" | "pattern";
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
  affectedFiles: string[];
  suggestion: string;
}

export interface DesignPattern {
  name: string;
  files: string[];
  description: string;
  confidence: "high" | "medium" | "low";
}

export interface ArchitectureResult {
  issues: ArchitectureIssue[];
  patterns: DesignPattern[];
  structure: {
    layers: string[];
    modules: { name: string; files: string[]; purpose?: string }[];
  };
  dependencies: {
    internal: { from: string; to: string; type: string }[];
    external: string[];
    circular: string[][];
  };
  metrics: {
    modularity: number; // 0-100
    coupling: number; // 0-100, lower is better
    cohesion: number; // 0-100, higher is better
  };
  architectureScore: number; // 0-100, higher is better
}

export class ArchitectureAgent extends BaseAgent {
  // Common architecture patterns
  private readonly LAYER_PATTERNS = {
    presentation: [/components?/, /views?/, /pages?/, /ui/, /frontend/],
    business: [/services?/, /business/, /domain/, /logic/],
    data: [/repositories?/, /dao/, /models?/, /entities?/, /database/, /db/],
    api: [/api/, /routes?/, /controllers?/, /handlers?/, /endpoints?/],
    utils: [/utils?/, /helpers?/, /lib/, /common/],
  };

  // Design pattern indicators
  private readonly PATTERN_INDICATORS = {
    singleton: [/getInstance/, /instance\s*=/, /static.*instance/],
    factory: [/create[A-Z]/, /Factory/, /Builder/],
    observer: [/subscribe/, /addEventListener/, /on[A-Z]/, /emit/],
    strategy: [/Strategy/, /execute/, /algorithm/],
    decorator: [/Decorator/, /wrap/, /enhance/],
    repository: [/Repository/, /findBy/, /save/, /delete/],
    mvc: [/Controller/, /Model/, /View/],
  };

  constructor() {
    super("Architecture");
  }

  async execute(context: AgentContext): Promise<AgentResult> {
    try {
      const { repositoryId, repositoryName, language } = context;

      this.logger.info(`Starting architecture analysis`, {
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

      // Get repository structure
      const tree = await githubService.getRepositoryTree(owner, repo);
      const codeFiles = githubService.getCodeFiles(tree);

      this.logger.info(`Analyzing architecture of ${codeFiles.length} files`);

      // Get file contents for analysis
      const filesToAnalyze = codeFiles.slice(0, 20);
      const fileContents = await githubService.getFilesBatch(
        owner,
        repo,
        filesToAnalyze.map((f) => f.path)
      );

      // Analyze different aspects
      const [structure, patterns, dependencies, issues] = await Promise.all([
        this.analyzeStructure(tree, codeFiles),
        this.detectDesignPatterns(fileContents, language),
        this.analyzeDependencies(fileContents, tree),
        this.detectArchitectureIssues(fileContents, tree, language),
      ]);

      // Calculate metrics
      const metrics = this.calculateMetrics(structure, dependencies, issues);
      const architectureScore = this.calculateArchitectureScore(metrics, issues);

      const result: ArchitectureResult = {
        issues,
        patterns,
        structure,
        dependencies,
        metrics,
        architectureScore,
      };

      return {
        success: true,
        data: result,
        metadata: {
          filesProcessed: fileContents.length,
        },
      };
    } catch (error) {
      this.logger.error("Architecture analysis failed", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Analyze project structure and identify layers/modules
   */
  private async analyzeStructure(
    tree: any[],
    codeFiles: any[]
  ): Promise<{ layers: string[]; modules: { name: string; files: string[]; purpose?: string }[] }> {
    this.logger.debug("Analyzing project structure");

    // Identify layers
    const layers: Set<string> = new Set();
    const moduleMap: Map<string, string[]> = new Map();

    for (const file of codeFiles) {
      const path = file.path.toLowerCase();

      // Detect layers
      for (const [layer, patterns] of Object.entries(this.LAYER_PATTERNS)) {
        if (patterns.some((pattern) => pattern.test(path))) {
          layers.add(layer);
        }
      }

      // Group by top-level directory
      const parts = file.path.split("/");
      if (parts.length > 1) {
        const moduleName = parts[0];
        if (!moduleMap.has(moduleName)) {
          moduleMap.set(moduleName, []);
        }
        moduleMap.get(moduleName)!.push(file.path);
      }
    }

    // Convert to modules array
    const modules = Array.from(moduleMap.entries()).map(([name, files]) => ({
      name,
      files,
      purpose: this.inferModulePurpose(name, files),
    }));

    return {
      layers: Array.from(layers),
      modules,
    };
  }

  /**
   * Infer module purpose from name and files
   */
  private inferModulePurpose(moduleName: string, files: string[]): string {
    const name = moduleName.toLowerCase();

    if (name.includes("test")) return "Testing and test utilities";
    if (name.includes("doc")) return "Documentation";
    if (name.includes("config")) return "Configuration files";
    if (name.includes("src") || name.includes("lib")) return "Source code";
    if (name.includes("api")) return "API endpoints and routes";
    if (name.includes("component")) return "UI components";
    if (name.includes("service")) return "Business logic services";
    if (name.includes("model")) return "Data models";
    if (name.includes("util")) return "Utility functions";
    if (name.includes("db") || name.includes("database")) return "Database layer";

    return "Module purpose unclear";
  }

  /**
   * Detect design patterns in code
   */
  private async detectDesignPatterns(
    files: any[],
    language: string
  ): Promise<DesignPattern[]> {
    this.logger.debug("Detecting design patterns");

    const patterns: DesignPattern[] = [];
    const patternFiles: Map<string, string[]> = new Map();

    // Pattern-based detection
    for (const file of files) {
      const content = file.content;

      for (const [patternName, indicators] of Object.entries(this.PATTERN_INDICATORS)) {
        const matches = indicators.filter((indicator) => indicator.test(content));

        if (matches.length > 0) {
          if (!patternFiles.has(patternName)) {
            patternFiles.set(patternName, []);
          }
          patternFiles.get(patternName)!.push(file.path);
        }
      }
    }

    // Convert to pattern objects
    for (const [name, fileList] of patternFiles.entries()) {
      const confidence = fileList.length > 2 ? "high" : fileList.length > 1 ? "medium" : "low";

      patterns.push({
        name: this.formatPatternName(name),
        files: fileList,
        description: this.getPatternDescription(name),
        confidence,
      });
    }

    // AI-based pattern detection for a few files
    if (files.length > 0) {
      try {
        const aiPatterns = await this.detectPatternsWithAI(files.slice(0, 3), language);
        patterns.push(...aiPatterns);
      } catch (error) {
        this.logger.warn("AI pattern detection failed", { error });
      }
    }

    return patterns;
  }

  /**
   * Detect patterns using AI
   */
  private async detectPatternsWithAI(files: any[], language: string): Promise<DesignPattern[]> {
    const patterns: DesignPattern[] = [];

    for (const file of files) {
      try {
        const prompt = `Analyze this ${language} code and identify any design patterns being used.

Code from ${file.path}:
\`\`\`${language}
${file.content.slice(0, 1500)}
\`\`\`

List any design patterns you detect (e.g., Singleton, Factory, Observer, Strategy, etc.).
For each pattern, provide:
- Pattern name
- Brief description of how it's implemented
- Confidence level (high/medium/low)

Format as a simple list.`;

        const aiService = config.isGeminiConfigured ? geminiService : openaiService;
        const result = await aiService.chatCompletion(
          [{ role: "user", content: prompt }],
          { temperature: 0.3, maxTokens: 500 }
        );

        const detectedPatterns = this.parseAIPatterns(result.content, file.path);
        patterns.push(...detectedPatterns);
      } catch (error) {
        this.logger.warn(`AI pattern detection failed for ${file.path}`, { error });
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return patterns;
  }

  /**
   * Parse AI pattern detection response
   */
  private parseAIPatterns(response: string, filePath: string): DesignPattern[] {
    const patterns: DesignPattern[] = [];
    const lines = response.split("\n");

    let currentPattern: Partial<DesignPattern> | null = null;

    for (const line of lines) {
      const lowerLine = line.toLowerCase();

      // Detect pattern names
      if (
        lowerLine.includes("singleton") ||
        lowerLine.includes("factory") ||
        lowerLine.includes("observer") ||
        lowerLine.includes("strategy") ||
        lowerLine.includes("decorator") ||
        lowerLine.includes("repository") ||
        lowerLine.includes("mvc") ||
        lowerLine.includes("mvvm")
      ) {
        if (currentPattern && currentPattern.name) {
          patterns.push(currentPattern as DesignPattern);
        }

        const patternName = line.trim().split(/[:-]/)[0].trim();
        currentPattern = {
          name: patternName,
          files: [filePath],
          confidence: "medium",
        };
      }

      if (currentPattern) {
        // Detect confidence
        if (lowerLine.includes("high confidence")) currentPattern.confidence = "high";
        else if (lowerLine.includes("low confidence")) currentPattern.confidence = "low";

        // Extract description
        if (!currentPattern.description && line.trim().length > 20) {
          currentPattern.description = line.trim();
        }
      }
    }

    if (currentPattern && currentPattern.name) {
      if (!currentPattern.description) {
        currentPattern.description = this.getPatternDescription(currentPattern.name.toLowerCase());
      }
      patterns.push(currentPattern as DesignPattern);
    }

    return patterns;
  }

  /**
   * Analyze dependencies
   */
  private async analyzeDependencies(
    files: any[],
    tree: any[]
  ): Promise<{ internal: { from: string; to: string; type: string }[]; external: string[]; circular: string[][] }> {
    this.logger.debug("Analyzing dependencies");

    const internal: { from: string; to: string; type: string }[] = [];
    const externalSet: Set<string> = new Set();
    const importMap: Map<string, string[]> = new Map();

    // Extract imports/requires
    for (const file of files) {
      const imports = this.extractImports(file.content);
      importMap.set(file.path, imports);

      for (const imp of imports) {
        if (imp.startsWith(".") || imp.startsWith("/")) {
          // Internal dependency
          internal.push({
            from: file.path,
            to: imp,
            type: "import",
          });
        } else {
          // External dependency
          externalSet.add(imp.split("/")[0]);
        }
      }
    }

    // Detect circular dependencies
    const circular = this.detectCircularDependencies(importMap);

    return {
      internal,
      external: Array.from(externalSet),
      circular,
    };
  }

  /**
   * Extract import statements
   */
  private extractImports(content: string): string[] {
    const imports: string[] = [];

    // Match various import patterns
    const patterns = [
      /import\s+.*from\s+['"]([^'"]+)['"]/g,
      /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
      /from\s+['"]([^'"]+)['"]/g,
    ];

    for (const pattern of patterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) imports.push(match[1]);
      }
    }

    return imports;
  }

  /**
   * Detect circular dependencies
   */
  private detectCircularDependencies(importMap: Map<string, string[]>): string[][] {
    const circular: string[][] = [];
    const visited: Set<string> = new Set();
    const recursionStack: Set<string> = new Set();

    const dfs = (file: string, path: string[]): void => {
      visited.add(file);
      recursionStack.add(file);
      path.push(file);

      const imports = importMap.get(file) || [];
      for (const imp of imports) {
        // Normalize import path
        const normalizedImp = imp.replace(/^\.\//, "").replace(/\.(ts|js|tsx|jsx)$/, "");

        // Find matching file
        const matchingFile = Array.from(importMap.keys()).find((f) =>
          f.includes(normalizedImp)
        );

        if (matchingFile) {
          if (recursionStack.has(matchingFile)) {
            // Found circular dependency
            const cycleStart = path.indexOf(matchingFile);
            if (cycleStart !== -1) {
              circular.push([...path.slice(cycleStart), matchingFile]);
            }
          } else if (!visited.has(matchingFile)) {
            dfs(matchingFile, [...path]);
          }
        }
      }

      recursionStack.delete(file);
    };

    for (const file of importMap.keys()) {
      if (!visited.has(file)) {
        dfs(file, []);
      }
    }

    return circular;
  }

  /**
   * Detect architecture issues
   */
  private async detectArchitectureIssues(
    files: any[],
    tree: any[],
    language: string
  ): Promise<ArchitectureIssue[]> {
    this.logger.debug("Detecting architecture issues");

    const issues: ArchitectureIssue[] = [];

    // Check for layering violations
    const layeringIssues = this.detectLayeringViolations(files);
    issues.push(...layeringIssues);

    // Check for tight coupling
    const couplingIssues = this.detectTightCoupling(files);
    issues.push(...couplingIssues);

    // Check for low cohesion
    const cohesionIssues = this.detectLowCohesion(files);
    issues.push(...cohesionIssues);

    return issues;
  }

  /**
   * Detect layering violations
   */
  private detectLayeringViolations(files: any[]): ArchitectureIssue[] {
    const issues: ArchitectureIssue[] = [];

    for (const file of files) {
      const path = file.path.toLowerCase();

      // Check if presentation layer imports data layer directly
      if (
        this.LAYER_PATTERNS.presentation.some((p) => p.test(path)) &&
        file.content.match(/from.*\/(models?|entities?|repositories?)\//)
      ) {
        issues.push({
          type: "layering",
          severity: "high",
          title: "Layering Violation",
          description: "Presentation layer directly imports from data layer",
          affectedFiles: [file.path],
          suggestion: "Use service layer to mediate between presentation and data layers",
        });
      }
    }

    return issues;
  }

  /**
   * Detect tight coupling
   */
  private detectTightCoupling(files: any[]): ArchitectureIssue[] {
    const issues: ArchitectureIssue[] = [];

    for (const file of files) {
      const imports = this.extractImports(file.content);

      // Too many imports indicates tight coupling
      if (imports.length > 15) {
        issues.push({
          type: "coupling",
          severity: "medium",
          title: "High Coupling",
          description: `File has ${imports.length} dependencies, indicating tight coupling`,
          affectedFiles: [file.path],
          suggestion: "Reduce dependencies through dependency injection or facade pattern",
        });
      }
    }

    return issues;
  }

  /**
   * Detect low cohesion
   */
  private detectLowCohesion(files: any[]): ArchitectureIssue[] {
    const issues: ArchitectureIssue[] = [];

    for (const file of files) {
      const lines = file.content.split("\n").length;
      const functions = (file.content.match(/function\s+\w+|const\s+\w+\s*=/g) || []).length;

      // Large file with many functions suggests low cohesion
      if (lines > 500 && functions > 10) {
        issues.push({
          type: "cohesion",
          severity: "medium",
          title: "Low Cohesion",
          description: `File has ${functions} functions in ${lines} lines, suggesting multiple responsibilities`,
          affectedFiles: [file.path],
          suggestion: "Split into multiple files with single, focused responsibilities",
        });
      }
    }

    return issues;
  }

  /**
   * Calculate architecture metrics
   */
  private calculateMetrics(
    structure: any,
    dependencies: any,
    issues: ArchitectureIssue[]
  ): { modularity: number; coupling: number; cohesion: number } {
    // Modularity: based on number of well-defined modules
    const modularity = Math.min(100, structure.modules.length * 10);

    // Coupling: based on internal dependencies (lower is better)
    const avgDependencies = dependencies.internal.length / Math.max(structure.modules.length, 1);
    const coupling = Math.max(0, 100 - avgDependencies * 5);

    // Cohesion: based on cohesion issues (higher is better)
    const cohesionIssues = issues.filter((i) => i.type === "cohesion").length;
    const cohesion = Math.max(0, 100 - cohesionIssues * 15);

    return { modularity, coupling, cohesion };
  }

  /**
   * Calculate overall architecture score
   */
  private calculateArchitectureScore(
    metrics: { modularity: number; coupling: number; cohesion: number },
    issues: ArchitectureIssue[]
  ): number {
    // Weighted average of metrics
    let score = metrics.modularity * 0.3 + metrics.coupling * 0.3 + metrics.cohesion * 0.4;

    // Deduct for issues
    const highIssues = issues.filter((i) => i.severity === "high").length;
    const mediumIssues = issues.filter((i) => i.severity === "medium").length;
    const lowIssues = issues.filter((i) => i.severity === "low").length;

    score -= highIssues * 10;
    score -= mediumIssues * 5;
    score -= lowIssues * 2;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Format pattern name
   */
  private formatPatternName(name: string): string {
    return name
      .split(/(?=[A-Z])/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  /**
   * Get pattern description
   */
  private getPatternDescription(patternName: string): string {
    const descriptions: Record<string, string> = {
      singleton: "Ensures a class has only one instance and provides global access",
      factory: "Creates objects without specifying exact classes",
      observer: "Defines one-to-many dependency between objects",
      strategy: "Defines family of algorithms and makes them interchangeable",
      decorator: "Adds behavior to objects dynamically",
      repository: "Mediates between domain and data mapping layers",
      mvc: "Separates application into Model, View, and Controller",
    };

    return descriptions[patternName.toLowerCase()] || "Design pattern detected";
  }
}

// Export singleton instance
export const architectureAgent = new ArchitectureAgent();

// Made with Bob