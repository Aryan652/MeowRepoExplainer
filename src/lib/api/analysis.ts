/**
 * src/lib/api/analysis.ts
 *
 * Server functions to mock the analysis pipeline.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { eq } from "drizzle-orm";

const steps = [
  "cloning",
  "language_detection",
  "ast_parsing",
  "embeddings",
  "agents",
  "completed",
] as const;

export const startAnalysis = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      repoId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    if (!process.env["DATABASE_URL"]) {
      return { success: true, jobId: "mock-job-id" };
    }

    const { getDb } = await import("@/db/client");
    const { analysisJobs, repositories } = await import("@/db/schema");
    const db = getDb();

    const jobId = `job_${Math.random().toString(36).slice(2, 9)}`;

    await db.insert(analysisJobs).values({
      id: jobId,
      repositoryId: data.repoId,
      step: "cloning",
      progress: 0,
    });

    await db
      .update(repositories)
      .set({ status: "analyzing" })
      .where(eq(repositories.id, data.repoId));

    // Simulate background work asynchronously
    // In a real app, you would dispatch this to a queue like Inngest, QStash, or Cloudflare Queues
    simulateAnalysis(jobId, data.repoId).catch(console.error);

    return { success: true, jobId };
  });

export const getAnalysisProgress = createServerFn({ method: "GET" })
  .inputValidator(
    z.object({
      jobId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    if (!process.env["DATABASE_URL"]) {
      return { step: "completed", progress: 100 };
    }

    const { getDb } = await import("@/db/client");
    const { analysisJobs } = await import("@/db/schema");
    const db = getDb();

    const [job] = await db
      .select()
      .from(analysisJobs)
      .where(eq(analysisJobs.id, data.jobId))
      .limit(1);

    if (!job) {
      throw new Error("Job not found");
    }

    return {
      step: job.step,
      progress: job.progress,
    };
  });

// ─── Fake Background Worker ──────────────────────────────────────────────────

async function simulateAnalysis(jobId: string, repoId: string) {
  const { getDb } = await import("@/db/client");
  const { analysisJobs, repositories, codeEmbeddings } = await import("@/db/schema");
  const db = getDb();

  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  for (let i = 0; i < steps.length - 1; i++) {
    await delay(1500); // 1.5 seconds per step

    const nextStep = steps[i + 1];
    const progress = Math.round(((i + 1) / (steps.length - 1)) * 100);

    await db
      .update(analysisJobs)
      .set({
        step: nextStep,
        progress,
        ...(nextStep === "completed" ? { finishedAt: new Date() } : {}),
      })
      .where(eq(analysisJobs.id, jobId));

    // Inject mock embeddings on completion
    if (nextStep === "completed") {
      try {
        await db.insert(codeEmbeddings).values([
          {
            id: crypto.randomUUID(),
            repositoryId: repoId,
            filePath: "src/auth/session.ts",
            functionName: "validateSession",
            content: "export async function validateSession(token) { return jwt.verify(token, secret); }",
            embedding: Array.from({ length: 1536 }, () => Math.random() * 2 - 1),
          },
          {
            id: crypto.randomUUID(),
            repositoryId: repoId,
            filePath: "src/payments/stripe.ts",
            functionName: "processCheckout",
            content: "export async function processCheckout(cartId) { const cart = await getCart(cartId); return stripe.charges.create({ amount: cart.total, currency: 'usd' }); }",
            embedding: Array.from({ length: 1536 }, () => Math.random() * 2 - 1),
          }
        ]);
      } catch (e) {
        console.error("Failed to insert mock embeddings:", e);
      }
    }
  }

  // Mark repo as ready with some fake stats
  await db
    .update(repositories)
    .set({
      status: "ready",
      health: Math.floor(Math.random() * 30) + 60, // 60-90
      debt: Math.floor(Math.random() * 50),
      coverage: Math.floor(Math.random() * 40) + 40, // 40-80
      lastAnalyzedAt: new Date(),
    })
    .where(eq(repositories.id, repoId));
}
