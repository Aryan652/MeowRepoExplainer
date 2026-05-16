/**
 * src/services/vector.service.ts
 * 
 * Vector Database Service - Manages code embeddings storage and similarity search.
 * Uses PostgreSQL with pgvector extension.
 */

import { config } from "@/lib/config";
import { createLogger } from "@/lib/logger";
import { openaiService } from "./openai.service";

const logger = createLogger("VectorService");

export interface CodeChunk {
  id?: string;
  repositoryId: string;
  filePath: string;
  functionName?: string;
  content: string;
  startLine?: number;
  endLine?: number;
  language?: string;
}

export interface CodeEmbedding extends CodeChunk {
  embedding: number[];
}

export interface SearchResult {
  chunk: CodeChunk;
  similarity: number;
  embedding?: number[];
}

export class VectorService {
  private isConfigured: boolean;

  constructor() {
    this.isConfigured = config.isDatabaseConfigured;
    
    if (!this.isConfigured) {
      logger.warn("Database not configured - vector operations will be disabled");
    }
  }

  /**
   * Check if vector service is available
   */
  isAvailable(): boolean {
    return this.isConfigured && openaiService.isAvailable();
  }

  /**
   * Generate and store embeddings for code chunks
   */
  async storeEmbeddings(chunks: CodeChunk[]): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error("Vector service is not available");
    }

    logger.info(`Storing embeddings for ${chunks.length} code chunks`);

    // Process in batches to respect rate limits
    const batchSize = config.embeddingBatchSize;
    const batches = this.chunkArray(chunks, batchSize);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      logger.debug(`Processing batch ${i + 1}/${batches.length}`);

      try {
        // Generate embeddings for batch
        const texts = batch.map((chunk) => chunk.content);
        const embeddings = await openaiService.generateEmbeddingsBatch(texts);

        // Store in database
        await this.storeBatchEmbeddings(batch, embeddings);

        // Small delay between batches
        if (i < batches.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (error) {
        logger.error(`Failed to process batch ${i + 1}`, error);
        throw error;
      }
    }

    logger.info(`Successfully stored ${chunks.length} embeddings`);
  }

  /**
   * Store a batch of embeddings in the database
   */
  private async storeBatchEmbeddings(
    chunks: CodeChunk[],
    embeddings: { embedding: number[] }[]
  ): Promise<void> {
    if (!config.isDatabaseConfigured) {
      logger.warn("Database not configured - skipping storage");
      return;
    }

    const { getDb } = await import("@/db/client");
    const { codeEmbeddings } = await import("@/db/schema");
    const db = getDb();

    const records = chunks.map((chunk, index) => ({
      id: crypto.randomUUID(),
      repositoryId: chunk.repositoryId,
      filePath: chunk.filePath,
      functionName: chunk.functionName,
      content: chunk.content,
      embedding: embeddings[index].embedding,
    }));

    await db.insert(codeEmbeddings).values(records);

    logger.debug(`Stored ${records.length} embeddings in database`);
  }

  /**
   * Search for similar code chunks using vector similarity
   */
  async searchSimilar(
    query: string,
    repositoryId: string,
    limit: number = 10,
    threshold: number = 0.7
  ): Promise<SearchResult[]> {
    if (!this.isAvailable()) {
      throw new Error("Vector service is not available");
    }

    logger.debug(`Searching for similar code chunks`, {
      repositoryId,
      queryLength: query.length,
      limit,
    });

    // Generate embedding for query
    const { embedding: queryEmbedding } = await openaiService.generateEmbedding(query);

    // Search in database using cosine similarity
    const results = await this.searchByEmbedding(
      queryEmbedding,
      repositoryId,
      limit,
      threshold
    );

    logger.debug(`Found ${results.length} similar chunks`);

    return results;
  }

  /**
   * Search by embedding vector
   */
  private async searchByEmbedding(
    embedding: number[],
    repositoryId: string,
    limit: number,
    threshold: number
  ): Promise<SearchResult[]> {
    if (!config.isDatabaseConfigured) {
      logger.warn("Database not configured - returning empty results");
      return [];
    }

    const { getDb } = await import("@/db/client");
    const { codeEmbeddings } = await import("@/db/schema");
    const { sql, eq } = await import("drizzle-orm");
    const db = getDb();

    // Use pgvector's cosine similarity operator (<=>)
    // Note: This requires pgvector extension to be enabled
    const results = await db
      .select({
        id: codeEmbeddings.id,
        repositoryId: codeEmbeddings.repositoryId,
        filePath: codeEmbeddings.filePath,
        functionName: codeEmbeddings.functionName,
        content: codeEmbeddings.content,
        embedding: codeEmbeddings.embedding,
        similarity: sql<number>`1 - (${codeEmbeddings.embedding} <=> ${JSON.stringify(embedding)}::vector)`,
      })
      .from(codeEmbeddings)
      .where(eq(codeEmbeddings.repositoryId, repositoryId))
      .orderBy(sql`${codeEmbeddings.embedding} <=> ${JSON.stringify(embedding)}::vector`)
      .limit(limit);

    // Filter by threshold and map to SearchResult
    return results
      .filter((r) => r.similarity >= threshold)
      .map((r) => ({
        chunk: {
          id: r.id,
          repositoryId: r.repositoryId,
          filePath: r.filePath,
          functionName: r.functionName || undefined,
          content: r.content,
        },
        similarity: r.similarity,
        embedding: r.embedding as number[],
      }));
  }

  /**
   * Get embeddings for a specific repository
   */
  async getRepositoryEmbeddings(repositoryId: string): Promise<CodeEmbedding[]> {
    if (!config.isDatabaseConfigured) {
      logger.warn("Database not configured - returning empty results");
      return [];
    }

    const { getDb } = await import("@/db/client");
    const { codeEmbeddings } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");
    const db = getDb();

    const results = await db
      .select()
      .from(codeEmbeddings)
      .where(eq(codeEmbeddings.repositoryId, repositoryId));

    return results.map((r) => ({
      id: r.id,
      repositoryId: r.repositoryId,
      filePath: r.filePath,
      functionName: r.functionName || undefined,
      content: r.content,
      embedding: r.embedding as number[],
    }));
  }

  /**
   * Delete embeddings for a repository
   */
  async deleteRepositoryEmbeddings(repositoryId: string): Promise<void> {
    if (!config.isDatabaseConfigured) {
      logger.warn("Database not configured - skipping deletion");
      return;
    }

    const { getDb } = await import("@/db/client");
    const { codeEmbeddings } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");
    const db = getDb();

    await db
      .delete(codeEmbeddings)
      .where(eq(codeEmbeddings.repositoryId, repositoryId));

    logger.info(`Deleted embeddings for repository ${repositoryId}`);
  }

  /**
   * Get embedding count for a repository
   */
  async getEmbeddingCount(repositoryId: string): Promise<number> {
    if (!config.isDatabaseConfigured) {
      return 0;
    }

    const { getDb } = await import("@/db/client");
    const { codeEmbeddings } = await import("@/db/schema");
    const { eq, count } = await import("drizzle-orm");
    const db = getDb();

    const result = await db
      .select({ count: count() })
      .from(codeEmbeddings)
      .where(eq(codeEmbeddings.repositoryId, repositoryId));

    return result[0]?.count || 0;
  }

  /**
   * Chunk code into smaller pieces for embedding
   */
  chunkCode(
    content: string,
    filePath: string,
    repositoryId: string,
    options: {
      maxChunkSize?: number;
      overlap?: number;
      language?: string;
    } = {}
  ): CodeChunk[] {
    const {
      maxChunkSize = 1000,
      overlap = 100,
      language = "unknown",
    } = options;

    const chunks: CodeChunk[] = [];
    const lines = content.split("\n");

    let currentChunk: string[] = [];
    let currentSize = 0;
    let startLine = 1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineSize = line.length;

      if (currentSize + lineSize > maxChunkSize && currentChunk.length > 0) {
        // Save current chunk
        chunks.push({
          repositoryId,
          filePath,
          content: currentChunk.join("\n"),
          startLine,
          endLine: i,
          language,
        });

        // Start new chunk with overlap
        const overlapLines = Math.floor(overlap / (currentSize / currentChunk.length));
        currentChunk = currentChunk.slice(-overlapLines);
        currentSize = currentChunk.reduce((sum, l) => sum + l.length, 0);
        startLine = i - overlapLines + 1;
      }

      currentChunk.push(line);
      currentSize += lineSize;
    }

    // Add final chunk
    if (currentChunk.length > 0) {
      chunks.push({
        repositoryId,
        filePath,
        content: currentChunk.join("\n"),
        startLine,
        endLine: lines.length,
        language,
      });
    }

    return chunks;
  }

  /**
   * Utility: Chunk array into smaller arrays
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Hybrid search: Combine vector similarity with keyword matching
   */
  async hybridSearch(
    query: string,
    repositoryId: string,
    options: {
      limit?: number;
      vectorWeight?: number;
      keywordWeight?: number;
    } = {}
  ): Promise<SearchResult[]> {
    const {
      limit = 10,
      vectorWeight = 0.7,
      keywordWeight = 0.3,
    } = options;

    // Get vector similarity results
    const vectorResults = await this.searchSimilar(query, repositoryId, limit * 2, 0.5);

    // Simple keyword matching (can be enhanced with BM25)
    const keywords = query.toLowerCase().split(/\s+/);
    const keywordScores = vectorResults.map((result) => {
      const content = result.chunk.content.toLowerCase();
      const score = keywords.reduce((sum, keyword) => {
        const matches = (content.match(new RegExp(keyword, "g")) || []).length;
        return sum + matches;
      }, 0);
      return score / keywords.length;
    });

    // Combine scores
    const combinedResults = vectorResults.map((result, index) => ({
      ...result,
      similarity:
        result.similarity * vectorWeight +
        keywordScores[index] * keywordWeight,
    }));

    // Sort by combined score and limit
    return combinedResults
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }
}

// Export singleton instance
export const vectorService = new VectorService();

// Made with Bob
