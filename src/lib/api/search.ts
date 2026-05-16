import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getDb } from "@/db/client";
import { codeEmbeddings } from "@/db/schema";
import { cosineDistance, desc, eq, sql } from "drizzle-orm";

export const semanticSearch = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      repoId: z.string(),
      query: z.string(),
      limit: z.number().default(5),
    }),
  )
  .handler(async ({ data }) => {
    const { repoId, query, limit } = data;
    
    let queryEmbedding: number[] = [];
    const apiKey = process.env["OPENAI_API_KEY"];

    if (apiKey) {
      try {
        const { default: OpenAI } = await import("openai");
        const openai = new OpenAI({ apiKey });
        const response = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: query,
        });
        queryEmbedding = response.data[0].embedding;
      } catch (err) {
        console.error("OpenAI Embedding Failed:", err);
      }
    }

    // If no OpenAI or failed, generate a random query vector for testing
    if (queryEmbedding.length === 0) {
      queryEmbedding = Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
    }

    if (!process.env["DATABASE_URL"]) {
      // Mock results if no DB
      return [
        {
          id: "mock-1",
          filePath: "src/auth/session.ts",
          functionName: "validateSession",
          content: "export async function validateSession(token) { return jwt.verify(token, secret); }",
          similarity: 0.92,
        },
      ];
    }

    const db = getDb();

    // Use pgvector's cosine distance to find nearest neighbors
    const similarity = sql<number>`1 - (${cosineDistance(
      codeEmbeddings.embedding,
      queryEmbedding,
    )})`;

    const results = await db
      .select({
        id: codeEmbeddings.id,
        filePath: codeEmbeddings.filePath,
        functionName: codeEmbeddings.functionName,
        content: codeEmbeddings.content,
        similarity,
      })
      .from(codeEmbeddings)
      .where(eq(codeEmbeddings.repositoryId, repoId))
      .orderBy((t) => desc(t.similarity))
      .limit(limit);

    return results;
  });
