/**
 * src/lib/config.ts
 * 
 * Centralized configuration management with validation and type safety.
 * All environment variables are validated at startup.
 */

import { z } from "zod";

// Environment variable schema with validation
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url().optional(),
  
  // Supabase
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  
  // OpenAI
  OPENAI_API_KEY: z.string().optional(),
  
  // GitHub
  GITHUB_TOKEN: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  
  // Application
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().default("8080"),
  APP_URL: z.string().url().default("http://localhost:8080"),
  
  // Security
  JWT_SECRET: z.string().optional(),
  CSRF_SECRET: z.string().optional(),
  
  // Vector Database (Optional)
  PINECONE_API_KEY: z.string().optional(),
  PINECONE_ENVIRONMENT: z.string().optional(),
  PINECONE_INDEX: z.string().optional(),
  
  // Redis (Optional)
  REDIS_URL: z.string().optional(),
  
  // Logging
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  
  // Rate Limiting
  RATE_LIMIT_MAX_REQUESTS: z.string().default("100"),
  RATE_LIMIT_WINDOW_MS: z.string().default("900000"),
  
  // Analysis Configuration
  MAX_REPO_SIZE_MB: z.string().default("500"),
  MAX_FILES_PER_REPO: z.string().default("50000"),
  EMBEDDING_BATCH_SIZE: z.string().default("100"),
  ANALYSIS_TIMEOUT_MS: z.string().default("300000"),
});

type Env = z.infer<typeof envSchema>;

// Parse and validate environment variables
function parseEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Invalid environment variables:");
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });
    }
    throw new Error("Environment validation failed");
  }
}

// Singleton config instance
let configInstance: Config | null = null;

export class Config {
  private env: Env;

  private constructor() {
    this.env = parseEnv();
  }

  static getInstance(): Config {
    if (!configInstance) {
      configInstance = new Config();
    }
    return configInstance;
  }

  // Database
  get databaseUrl(): string | undefined {
    return this.env.DATABASE_URL;
  }

  get isDatabaseConfigured(): boolean {
    return !!this.env.DATABASE_URL;
  }

  // Supabase
  get supabaseUrl(): string | undefined {
    return this.env.SUPABASE_URL;
  }

  get supabaseAnonKey(): string | undefined {
    return this.env.SUPABASE_ANON_KEY;
  }

  get supabaseServiceRoleKey(): string | undefined {
    return this.env.SUPABASE_SERVICE_ROLE_KEY;
  }

  get isSupabaseConfigured(): boolean {
    return !!(this.env.SUPABASE_URL && this.env.SUPABASE_ANON_KEY);
  }

  // OpenAI
  get openaiApiKey(): string | undefined {
    return this.env.OPENAI_API_KEY;
  }

  get isOpenAIConfigured(): boolean {
    return !!this.env.OPENAI_API_KEY;
  }

  // GitHub
  get githubToken(): string | undefined {
    return this.env.GITHUB_TOKEN;
  }

  get githubClientId(): string | undefined {
    return this.env.GITHUB_CLIENT_ID;
  }

  get githubClientSecret(): string | undefined {
    return this.env.GITHUB_CLIENT_SECRET;
  }

  get isGitHubConfigured(): boolean {
    return !!this.env.GITHUB_TOKEN;
  }

  get isGitHubOAuthConfigured(): boolean {
    return !!(this.env.GITHUB_CLIENT_ID && this.env.GITHUB_CLIENT_SECRET);
  }

  // Application
  get nodeEnv(): string {
    return this.env.NODE_ENV;
  }

  get isDevelopment(): boolean {
    return this.env.NODE_ENV === "development";
  }

  get isProduction(): boolean {
    return this.env.NODE_ENV === "production";
  }

  get isTest(): boolean {
    return this.env.NODE_ENV === "test";
  }

  get port(): number {
    return parseInt(this.env.PORT, 10);
  }

  get appUrl(): string {
    return this.env.APP_URL;
  }

  // Security
  get jwtSecret(): string {
    return this.env.JWT_SECRET || "dev-jwt-secret-change-in-production";
  }

  get csrfSecret(): string {
    return this.env.CSRF_SECRET || "dev-csrf-secret-change-in-production";
  }

  // Vector Database
  get pineconeApiKey(): string | undefined {
    return this.env.PINECONE_API_KEY;
  }

  get pineconeEnvironment(): string | undefined {
    return this.env.PINECONE_ENVIRONMENT;
  }

  get pineconeIndex(): string | undefined {
    return this.env.PINECONE_INDEX;
  }

  get isPineconeConfigured(): boolean {
    return !!(
      this.env.PINECONE_API_KEY &&
      this.env.PINECONE_ENVIRONMENT &&
      this.env.PINECONE_INDEX
    );
  }

  // Redis
  get redisUrl(): string | undefined {
    return this.env.REDIS_URL;
  }

  get isRedisConfigured(): boolean {
    return !!this.env.REDIS_URL;
  }

  // Logging
  get logLevel(): string {
    return this.env.LOG_LEVEL;
  }

  // Rate Limiting
  get rateLimitMaxRequests(): number {
    return parseInt(this.env.RATE_LIMIT_MAX_REQUESTS, 10);
  }

  get rateLimitWindowMs(): number {
    return parseInt(this.env.RATE_LIMIT_WINDOW_MS, 10);
  }

  // Analysis Configuration
  get maxRepoSizeMB(): number {
    return parseInt(this.env.MAX_REPO_SIZE_MB, 10);
  }

  get maxFilesPerRepo(): number {
    return parseInt(this.env.MAX_FILES_PER_REPO, 10);
  }

  get embeddingBatchSize(): number {
    return parseInt(this.env.EMBEDDING_BATCH_SIZE, 10);
  }

  get analysisTimeoutMs(): number {
    return parseInt(this.env.ANALYSIS_TIMEOUT_MS, 10);
  }

  // Feature flags based on configuration
  get features() {
    return {
      database: this.isDatabaseConfigured,
      authentication: this.isSupabaseConfigured,
      aiAnalysis: this.isOpenAIConfigured,
      githubIntegration: this.isGitHubConfigured,
      githubOAuth: this.isGitHubOAuthConfigured,
      vectorSearch: this.isPineconeConfigured || this.isDatabaseConfigured, // pgvector fallback
      caching: this.isRedisConfigured,
    };
  }

  // Print configuration status (for debugging)
  printStatus(): void {
    console.log("\n🔧 Configuration Status:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`Environment: ${this.nodeEnv}`);
    console.log(`App URL: ${this.appUrl}`);
    console.log("\nFeatures:");
    console.log(`  Database: ${this.features.database ? "✅" : "❌ (using mock data)"}`);
    console.log(`  Authentication: ${this.features.authentication ? "✅" : "❌ (using mock auth)"}`);
    console.log(`  AI Analysis: ${this.features.aiAnalysis ? "✅" : "❌"}`);
    console.log(`  GitHub Integration: ${this.features.githubIntegration ? "✅" : "❌"}`);
    console.log(`  GitHub OAuth: ${this.features.githubOAuth ? "✅" : "❌"}`);
    console.log(`  Vector Search: ${this.features.vectorSearch ? "✅" : "❌"}`);
    console.log(`  Caching: ${this.features.caching ? "✅" : "❌"}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  }
}

// Export singleton instance
export const config = Config.getInstance();

// Print status in development
if (config.isDevelopment) {
  config.printStatus();
}

// Made with Bob
