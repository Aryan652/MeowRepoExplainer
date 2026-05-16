/**
 * src/agents/security.agent.ts
 * 
 * Security Agent - Scans code for security vulnerabilities and unsafe patterns.
 */

import { BaseAgent, AgentContext, AgentResult } from "./base.agent";
import { openaiService } from "@/services/openai.service";
import { githubService } from "@/services/github.service";

export interface SecurityIssue {
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  file: string;
  line?: number;
  recommendation: string;
  cwe?: string; // Common Weakness Enumeration ID
}

export interface SecurityResult {
  issues: SecurityIssue[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  };
  score: number; // 0-100, higher is better
}

export class SecurityAgent extends BaseAgent {
  // Common security patterns to check
  private readonly SECURITY_PATTERNS = {
    hardcodedSecrets: [
      /api[_-]?key\s*=\s*['"][^'"]+['"]/gi,
      /password\s*=\s*['"][^'"]+['"]/gi,
      /secret\s*=\s*['"][^'"]+['"]/gi,
      /token\s*=\s*['"][^'"]+['"]/gi,
      /aws[_-]?access[_-]?key/gi,
      /private[_-]?key/gi,
    ],
    sqlInjection: [
      /execute\s*\(\s*['"].*\$.*['"]/gi,
      /query\s*\(\s*['"].*\+.*['"]/gi,
      /SELECT.*FROM.*WHERE.*\+/gi,
    ],
    xss: [
      /innerHTML\s*=/gi,
      /dangerouslySetInnerHTML/gi,
      /document\.write/gi,
      /eval\s*\(/gi,
    ],
    insecureRandom: [
      /Math\.random\(\)/gi,
    ],
    weakCrypto: [
      /md5/gi,
      /sha1(?!256|384|512)/gi,
    ],
  };

  constructor() {
    super("Security");
  }

  async execute(context: AgentContext): Promise<AgentResult> {
    try {
      const { repositoryId, repositoryName, language } = context;

      // Parse GitHub URL
      const parsed = githubService.parseGitHubUrl(repositoryName);
      if (!parsed) {
        return {
          success: false,
          error: "Invalid repository name format",
        };
      }

      const { owner, repo } = parsed;

      // Get code files
      const tree = await githubService.getRepositoryTree(owner, repo);
      const codeFiles = githubService.getCodeFiles(tree);

      this.logger.info(`Scanning ${codeFiles.length} files for security issues`);

      // Get file contents (limit to avoid token limits)
      const filesToScan = codeFiles.slice(0, 20);
      const fileContents = await githubService.getFilesBatch(
        owner,
        repo,
        filesToScan.map((f) => f.path)
      );

      // Run security scans
      const [patternIssues, aiIssues] = await Promise.all([
        this.scanWithPatterns(fileContents),
        this.scanWithAI(fileContents, language),
      ]);

      // Combine and deduplicate issues
      const allIssues = [...patternIssues, ...aiIssues];
      const uniqueIssues = this.deduplicateIssues(allIssues);

      // Calculate summary and score
      const summary = this.calculateSummary(uniqueIssues);
      const score = this.calculateSecurityScore(summary, fileContents.length);

      const result: SecurityResult = {
        issues: uniqueIssues,
        summary,
        score,
      };

      return {
        success: true,
        data: result,
        metadata: {
          filesProcessed: fileContents.length,
        },
      };
    } catch (error) {
      this.logger.error("Security scan failed", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Scan files using regex patterns
   */
  private async scanWithPatterns(files: any[]): Promise<SecurityIssue[]> {
    this.logger.debug("Running pattern-based security scan");

    const issues: SecurityIssue[] = [];

    for (const file of files) {
      const content = file.content;
      const lines = content.split("\n");

      // Check for hardcoded secrets
      for (const pattern of this.SECURITY_PATTERNS.hardcodedSecrets) {
        const matches = content.match(pattern);
        if (matches) {
          issues.push({
            severity: "critical",
            title: "Hardcoded Secret Detected",
            description: `Potential hardcoded secret found: ${matches[0].slice(0, 50)}...`,
            file: file.path,
            recommendation: "Move secrets to environment variables or a secure vault",
            cwe: "CWE-798",
          });
        }
      }

      // Check for SQL injection
      for (const pattern of this.SECURITY_PATTERNS.sqlInjection) {
        const matches = content.match(pattern);
        if (matches) {
          issues.push({
            severity: "high",
            title: "Potential SQL Injection",
            description: "SQL query appears to use string concatenation",
            file: file.path,
            recommendation: "Use parameterized queries or an ORM",
            cwe: "CWE-89",
          });
        }
      }

      // Check for XSS vulnerabilities
      for (const pattern of this.SECURITY_PATTERNS.xss) {
        const matches = content.match(pattern);
        if (matches) {
          issues.push({
            severity: "high",
            title: "Potential XSS Vulnerability",
            description: `Unsafe HTML manipulation detected: ${matches[0]}`,
            file: file.path,
            recommendation: "Sanitize user input and use safe DOM manipulation methods",
            cwe: "CWE-79",
          });
        }
      }

      // Check for insecure random
      for (const pattern of this.SECURITY_PATTERNS.insecureRandom) {
        if (pattern.test(content)) {
          issues.push({
            severity: "medium",
            title: "Insecure Random Number Generation",
            description: "Math.random() is not cryptographically secure",
            file: file.path,
            recommendation: "Use crypto.randomBytes() or crypto.getRandomValues()",
            cwe: "CWE-338",
          });
        }
      }

      // Check for weak cryptography
      for (const pattern of this.SECURITY_PATTERNS.weakCrypto) {
        if (pattern.test(content)) {
          issues.push({
            severity: "medium",
            title: "Weak Cryptographic Algorithm",
            description: "MD5 or SHA1 detected - these are cryptographically broken",
            file: file.path,
            recommendation: "Use SHA-256, SHA-384, or SHA-512 instead",
            cwe: "CWE-327",
          });
        }
      }
    }

    return issues;
  }

  /**
   * Scan files using AI analysis
   */
  private async scanWithAI(files: any[], language: string): Promise<SecurityIssue[]> {
    this.logger.debug("Running AI-powered security scan");

    const issues: SecurityIssue[] = [];

    // Process files in batches
    const batches = this.chunkArray(files, 3);

    for (const batch of batches) {
      const batchIssues = await Promise.all(
        batch.map(async (file) => {
          try {
            const analysis = await openaiService.analyzeSecurityIssues(
              file.content,
              language
            );

            // Parse AI response to extract issues
            return this.parseAISecurityResponse(analysis, file.path);
          } catch (error) {
            this.logger.warn(`AI scan failed for ${file.path}`, { error });
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
   * Parse AI security analysis response
   */
  private parseAISecurityResponse(response: string, filePath: string): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    // Simple parsing - look for severity indicators
    const lines = response.split("\n");
    let currentIssue: Partial<SecurityIssue> | null = null;

    for (const line of lines) {
      const lowerLine = line.toLowerCase();

      // Detect severity
      if (lowerLine.includes("critical") || lowerLine.includes("severe")) {
        if (currentIssue) issues.push(currentIssue as SecurityIssue);
        currentIssue = { severity: "critical", file: filePath };
      } else if (lowerLine.includes("high")) {
        if (currentIssue) issues.push(currentIssue as SecurityIssue);
        currentIssue = { severity: "high", file: filePath };
      } else if (lowerLine.includes("medium") || lowerLine.includes("moderate")) {
        if (currentIssue) issues.push(currentIssue as SecurityIssue);
        currentIssue = { severity: "medium", file: filePath };
      } else if (lowerLine.includes("low") || lowerLine.includes("minor")) {
        if (currentIssue) issues.push(currentIssue as SecurityIssue);
        currentIssue = { severity: "low", file: filePath };
      }

      // Extract title and description
      if (currentIssue && line.trim()) {
        if (!currentIssue.title) {
          currentIssue.title = line.trim().slice(0, 100);
        } else if (!currentIssue.description) {
          currentIssue.description = line.trim();
        } else if (!currentIssue.recommendation && lowerLine.includes("recommend")) {
          currentIssue.recommendation = line.trim();
        }
      }
    }

    if (currentIssue && currentIssue.title) {
      issues.push(currentIssue as SecurityIssue);
    }

    return issues;
  }

  /**
   * Deduplicate similar issues
   */
  private deduplicateIssues(issues: SecurityIssue[]): SecurityIssue[] {
    const seen = new Set<string>();
    const unique: SecurityIssue[] = [];

    for (const issue of issues) {
      const key = `${issue.file}:${issue.title}`;
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
  private calculateSummary(issues: SecurityIssue[]) {
    const summary = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      total: issues.length,
    };

    for (const issue of issues) {
      summary[issue.severity]++;
    }

    return summary;
  }

  /**
   * Calculate security score (0-100)
   */
  private calculateSecurityScore(summary: any, filesScanned: number): number {
    // Start with perfect score
    let score = 100;

    // Deduct points based on severity
    score -= summary.critical * 20;
    score -= summary.high * 10;
    score -= summary.medium * 5;
    score -= summary.low * 2;

    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, score));
  }
}

// Export singleton instance
export const securityAgent = new SecurityAgent();

// Made with Bob
