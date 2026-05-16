/**
 * src/services/github.service.ts
 * 
 * GitHub API integration for repository access and cloning.
 */

import { config } from "@/lib/config";
import { createLogger } from "@/lib/logger";

const logger = createLogger("GitHubService");

export interface GitHubRepo {
  owner: string;
  name: string;
  fullName: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  size: number; // in KB
  defaultBranch: string;
  isPrivate: boolean;
  url: string;
  cloneUrl: string;
}

export interface GitHubFile {
  path: string;
  content: string;
  size: number;
  sha: string;
}

export interface GitHubTree {
  path: string;
  type: "blob" | "tree";
  size?: number;
  sha: string;
}

export class GitHubService {
  private baseUrl = "https://api.github.com";
  private token: string | undefined;

  constructor() {
    this.token = config.githubToken;
    if (!this.token) {
      logger.warn("GitHub token not configured - API rate limits will apply");
    }
  }

  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      Accept: "application/vnd.github.v3+json",
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    logger.debug(`GitHub API request: ${endpoint}`);

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      logger.error(`GitHub API error: ${response.status}`, new Error(error));
      throw new Error(`GitHub API error: ${response.status} - ${error}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Parse GitHub URL to extract owner and repo name
   */
  parseGitHubUrl(url: string): { owner: string; repo: string } | null {
    try {
      const patterns = [
        /github\.com\/([^\/]+)\/([^\/]+)/,
        /^([^\/]+)\/([^\/]+)$/,
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
          return {
            owner: match[1],
            repo: match[2].replace(/\.git$/, ""),
          };
        }
      }

      return null;
    } catch (error) {
      logger.error("Failed to parse GitHub URL", error);
      return null;
    }
  }

  /**
   * Get repository information
   */
  async getRepository(owner: string, repo: string): Promise<GitHubRepo> {
    logger.info(`Fetching repository: ${owner}/${repo}`);

    const data = await this.fetch<any>(`/repos/${owner}/${repo}`);

    return {
      owner: data.owner.login,
      name: data.name,
      fullName: data.full_name,
      description: data.description,
      language: data.language,
      stars: data.stargazers_count,
      forks: data.forks_count,
      size: data.size,
      defaultBranch: data.default_branch,
      isPrivate: data.private,
      url: data.html_url,
      cloneUrl: data.clone_url,
    };
  }

  /**
   * Get repository tree (file structure)
   */
  async getRepositoryTree(
    owner: string,
    repo: string,
    branch?: string
  ): Promise<GitHubTree[]> {
    const repoInfo = await this.getRepository(owner, repo);
    const branchName = branch || repoInfo.defaultBranch;

    logger.info(`Fetching tree for ${owner}/${repo}@${branchName}`);

    const data = await this.fetch<any>(
      `/repos/${owner}/${repo}/git/trees/${branchName}?recursive=1`
    );

    return data.tree.map((item: any) => ({
      path: item.path,
      type: item.type,
      size: item.size,
      sha: item.sha,
    }));
  }

  /**
   * Get file content
   */
  async getFileContent(
    owner: string,
    repo: string,
    path: string,
    branch?: string
  ): Promise<GitHubFile> {
    const repoInfo = await this.getRepository(owner, repo);
    const branchName = branch || repoInfo.defaultBranch;

    logger.debug(`Fetching file: ${owner}/${repo}/${path}`);

    const data = await this.fetch<any>(
      `/repos/${owner}/${repo}/contents/${path}?ref=${branchName}`
    );

    if (data.type !== "file") {
      throw new Error(`Path ${path} is not a file`);
    }

    // Decode base64 content
    const content = Buffer.from(data.content, "base64").toString("utf-8");

    return {
      path: data.path,
      content,
      size: data.size,
      sha: data.sha,
    };
  }

  /**
   * Get multiple files in batch
   */
  async getFilesBatch(
    owner: string,
    repo: string,
    paths: string[],
    branch?: string
  ): Promise<GitHubFile[]> {
    logger.info(`Fetching ${paths.length} files from ${owner}/${repo}`);

    const files = await Promise.all(
      paths.map(async (path) => {
        try {
          return await this.getFileContent(owner, repo, path, branch);
        } catch (error) {
          logger.warn(`Failed to fetch file: ${path}`, { error });
          return null;
        }
      })
    );

    return files.filter((f): f is GitHubFile => f !== null);
  }

  /**
   * Get repository languages
   */
  async getRepositoryLanguages(
    owner: string,
    repo: string
  ): Promise<Record<string, number>> {
    logger.debug(`Fetching languages for ${owner}/${repo}`);

    return this.fetch<Record<string, number>>(`/repos/${owner}/${repo}/languages`);
  }

  /**
   * Check if repository is accessible
   */
  async isRepositoryAccessible(owner: string, repo: string): Promise<boolean> {
    try {
      await this.getRepository(owner, repo);
      return true;
    } catch (error) {
      logger.warn(`Repository ${owner}/${repo} is not accessible`, { error });
      return false;
    }
  }

  /**
   * Get repository size and file count
   */
  async getRepositoryStats(
    owner: string,
    repo: string
  ): Promise<{ size: number; fileCount: number; languages: Record<string, number> }> {
    const [repoInfo, tree, languages] = await Promise.all([
      this.getRepository(owner, repo),
      this.getRepositoryTree(owner, repo),
      this.getRepositoryLanguages(owner, repo),
    ]);

    const fileCount = tree.filter((item) => item.type === "blob").length;

    return {
      size: repoInfo.size,
      fileCount,
      languages,
    };
  }

  /**
   * Filter files by extension
   */
  filterFilesByExtension(tree: GitHubTree[], extensions: string[]): GitHubTree[] {
    return tree.filter((item) => {
      if (item.type !== "blob") return false;
      const ext = item.path.split(".").pop()?.toLowerCase();
      return ext && extensions.includes(ext);
    });
  }

  /**
   * Get code files only (exclude common non-code files)
   */
  getCodeFiles(tree: GitHubTree[]): GitHubTree[] {
    const codeExtensions = [
      "ts", "tsx", "js", "jsx", "py", "java", "go", "rs", "c", "cpp", "h",
      "cs", "rb", "php", "swift", "kt", "scala", "r", "m", "sh", "sql",
      "html", "css", "scss", "sass", "less", "vue", "svelte",
    ];

    const excludePatterns = [
      /node_modules/,
      /\.git/,
      /dist/,
      /build/,
      /coverage/,
      /\.next/,
      /\.nuxt/,
      /vendor/,
      /\.venv/,
      /venv/,
      /__pycache__/,
      /\.pytest_cache/,
      /\.idea/,
      /\.vscode/,
    ];

    return tree.filter((item) => {
      if (item.type !== "blob") return false;
      
      // Check if path matches exclude patterns
      if (excludePatterns.some((pattern) => pattern.test(item.path))) {
        return false;
      }

      // Check if file has code extension
      const ext = item.path.split(".").pop()?.toLowerCase();
      return ext && codeExtensions.includes(ext);
    });
  }

  /**
   * Validate repository size
   */
  async validateRepositorySize(owner: string, repo: string): Promise<{
    valid: boolean;
    size: number;
    maxSize: number;
    fileCount: number;
    maxFiles: number;
  }> {
    const stats = await this.getRepositoryStats(owner, repo);
    const maxSizeKB = config.maxRepoSizeMB * 1024;
    const maxFiles = config.maxFilesPerRepo;

    return {
      valid: stats.size <= maxSizeKB && stats.fileCount <= maxFiles,
      size: stats.size,
      maxSize: maxSizeKB,
      fileCount: stats.fileCount,
      maxFiles,
    };
  }
}

// Export singleton instance
export const githubService = new GitHubService();

// Made with Bob
