/**
 * src/agents/documentation.agent.ts
 * 
 * Documentation Agent - Generates comprehensive documentation for repositories.
 */

import { BaseAgent, AgentContext, AgentResult } from "./base.agent";
import { openaiService } from "@/services/openai.service";
import { githubService } from "@/services/github.service";

export interface DocumentationResult {
  readme: string;
  apiDocs: string[];
  setupGuide: string;
  contributingGuide: string;
  architecture: string;
}

export class DocumentationAgent extends BaseAgent {
  constructor() {
    super("Documentation");
  }

  async execute(context: AgentContext): Promise<AgentResult> {
    try {
      const { repositoryId, repositoryName, language } = context;

      // Parse GitHub URL to get owner and repo
      const parsed = githubService.parseGitHubUrl(repositoryName);
      if (!parsed) {
        return {
          success: false,
          error: "Invalid repository name format",
        };
      }

      const { owner, repo } = parsed;

      // Get repository information
      const repoInfo = await githubService.getRepository(owner, repo);
      const tree = await githubService.getRepositoryTree(owner, repo);
      const codeFiles = githubService.getCodeFiles(tree);

      this.logger.info(`Processing ${codeFiles.length} code files`);

      // Get sample files for analysis (limit to avoid token limits)
      const sampleFiles = codeFiles.slice(0, 10);
      const fileContents = await githubService.getFilesBatch(
        owner,
        repo,
        sampleFiles.map((f) => f.path)
      );

      // Generate different types of documentation
      const [readme, setupGuide, architecture] = await Promise.all([
        this.generateReadme(repoInfo, fileContents, language),
        this.generateSetupGuide(repoInfo, fileContents, language),
        this.generateArchitectureDoc(repoInfo, fileContents, tree, language),
      ]);

      // Generate API documentation for key files
      const apiDocs = await this.generateApiDocs(fileContents, language);

      const result: DocumentationResult = {
        readme,
        apiDocs,
        setupGuide,
        contributingGuide: this.generateContributingGuide(repoInfo, language),
        architecture,
      };

      return {
        success: true,
        data: result,
        metadata: {
          filesProcessed: fileContents.length,
        },
      };
    } catch (error) {
      this.logger.error("Documentation generation failed", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Generate README.md
   */
  private async generateReadme(
    repoInfo: any,
    files: any[],
    language: string
  ): Promise<string> {
    this.logger.debug("Generating README");

    const codeContext = files
      .slice(0, 5)
      .map((f) => `File: ${f.path}\n${f.content.slice(0, 500)}`)
      .join("\n\n");

    const prompt = `Generate a comprehensive README.md for this ${language} repository.

Repository: ${repoInfo.fullName}
Description: ${repoInfo.description || "No description"}
Language: ${language}
Stars: ${repoInfo.stars}

Sample code files:
${codeContext}

Include:
1. Project title and description
2. Key features
3. Installation instructions
4. Quick start guide
5. Usage examples
6. Contributing guidelines
7. License information

Format in Markdown.`;

    const result = await openaiService.chatCompletion(
      [{ role: "user", content: prompt }],
      { temperature: 0.4, maxTokens: 2000 }
    );

    return result.content;
  }

  /**
   * Generate setup/installation guide
   */
  private async generateSetupGuide(
    repoInfo: any,
    files: any[],
    language: string
  ): Promise<string> {
    this.logger.debug("Generating setup guide");

    // Look for package.json, requirements.txt, etc.
    const configFiles = files.filter((f) =>
      /package\.json|requirements\.txt|Gemfile|go\.mod|Cargo\.toml/.test(f.path)
    );

    const configContext = configFiles
      .map((f) => `${f.path}:\n${f.content}`)
      .join("\n\n");

    const prompt = `Generate a detailed setup and installation guide for this ${language} project.

Repository: ${repoInfo.fullName}
Language: ${language}

Configuration files:
${configContext || "No configuration files found"}

Include:
1. Prerequisites (Node.js version, Python version, etc.)
2. Installation steps
3. Environment setup
4. Database setup (if applicable)
5. Running the application
6. Running tests
7. Troubleshooting common issues

Format in Markdown.`;

    const result = await openaiService.chatCompletion(
      [{ role: "user", content: prompt }],
      { temperature: 0.3, maxTokens: 1500 }
    );

    return result.content;
  }

  /**
   * Generate architecture documentation
   */
  private async generateArchitectureDoc(
    repoInfo: any,
    files: any[],
    tree: any[],
    language: string
  ): Promise<string> {
    this.logger.debug("Generating architecture documentation");

    // Analyze directory structure
    const directories = tree
      .filter((item) => item.type === "tree")
      .map((item) => item.path)
      .slice(0, 20);

    const structureContext = `Directory structure:\n${directories.join("\n")}`;

    const codeContext = files
      .slice(0, 5)
      .map((f) => `${f.path}:\n${f.content.slice(0, 300)}`)
      .join("\n\n");

    const prompt = `Generate architecture documentation for this ${language} project.

Repository: ${repoInfo.fullName}
Language: ${language}

${structureContext}

Sample code:
${codeContext}

Include:
1. High-level architecture overview
2. Directory structure explanation
3. Key components and their responsibilities
4. Data flow
5. Design patterns used
6. Technology stack
7. External dependencies

Format in Markdown with diagrams described in text.`;

    const result = await openaiService.chatCompletion(
      [{ role: "user", content: prompt }],
      { temperature: 0.4, maxTokens: 2000 }
    );

    return result.content;
  }

  /**
   * Generate API documentation for files
   */
  private async generateApiDocs(files: any[], language: string): Promise<string[]> {
    this.logger.debug(`Generating API docs for ${files.length} files`);

    const apiDocs: string[] = [];

    // Process files in batches to avoid rate limits
    const batches = this.chunkArray(files, 3);

    for (const batch of batches) {
      const batchDocs = await Promise.all(
        batch.map(async (file) => {
          try {
            const doc = await openaiService.generateDocumentation(
              file.content,
              language
            );
            return `# ${file.path}\n\n${doc}`;
          } catch (error) {
            this.logger.warn(`Failed to generate docs for ${file.path}`, { error });
            return `# ${file.path}\n\nDocumentation generation failed.`;
          }
        })
      );

      apiDocs.push(...batchDocs);

      // Small delay between batches to respect rate limits
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return apiDocs;
  }

  /**
   * Generate contributing guide
   */
  private generateContributingGuide(repoInfo: any, language: string): string {
    // This can be a template-based generation for now
    return `# Contributing to ${repoInfo.name}

Thank you for your interest in contributing to ${repoInfo.name}!

## Getting Started

1. Fork the repository
2. Clone your fork: \`git clone ${repoInfo.cloneUrl}\`
3. Create a feature branch: \`git checkout -b feature/your-feature\`
4. Make your changes
5. Run tests to ensure everything works
6. Commit your changes: \`git commit -m "Add your feature"\`
7. Push to your fork: \`git push origin feature/your-feature\`
8. Open a Pull Request

## Code Style

- Follow the existing code style in the project
- Write clear, descriptive commit messages
- Add tests for new features
- Update documentation as needed

## Pull Request Process

1. Ensure all tests pass
2. Update the README.md with details of changes if applicable
3. The PR will be merged once you have the sign-off of at least one maintainer

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Respect differing viewpoints and experiences

## Questions?

Feel free to open an issue for any questions or concerns.

Thank you for contributing! 🎉`;
  }
}

// Export singleton instance
export const documentationAgent = new DocumentationAgent();

// Made with Bob
