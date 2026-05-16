/**
 * src/lib/api/repos.ts
 *
 * TanStack Start server functions for repository CRUD.
 * These run server-side only and safely access the DB.
 *
 * When DATABASE_URL is not configured the functions fall back to the
 * static mock data so the UI stays functional during local dev before
 * Supabase is wired up.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { eq } from "drizzle-orm";

// ─── Types (shared client + server) ───────────────────────────────────────────

export type RepoSummary = {
  id: string;
  name: string;
  org: string;
  stars: string;
  language: string;
  files: number;
  size: string;
  lastAnalyzed: string;
  status: "ready" | "analyzing" | "error";
  health: number;
  debt: number;
  coverage: number;
  description: string;
};

// ─── Fallback mock (used when DB not configured) ───────────────────────────────

import { repos as mockRepos } from "@/lib/mock-data";

function toSummary(r: (typeof mockRepos)[0]): RepoSummary {
  return {
    id: r.id,
    name: r.name,
    org: r.org,
    stars: r.stars,
    language: r.language,
    files: r.files,
    size: r.size,
    lastAnalyzed: r.lastAnalyzed,
    status: r.status,
    health: r.health,
    debt: r.debt,
    coverage: r.coverage,
    description: r.description,
  };
}

// ─── Server Functions ──────────────────────────────────────────────────────────

/**
 * List all repositories for the current user.
 * Falls back to mock data if DATABASE_URL is not set.
 */
export const listRepos = createServerFn({ method: "GET" }).handler(
  async (): Promise<RepoSummary[]> => {
    if (!process.env["DATABASE_URL"]) {
      // Graceful degradation: return mock data
      return mockRepos.map(toSummary);
    }

    const { getDb } = await import("@/db/client");
    const { repositories } = await import("@/db/schema");
    const db = getDb();

    const rows = await db
      .select()
      .from(repositories)
      .orderBy(repositories.createdAt);

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      org: r.org,
      stars: r.stars,
      language: r.language,
      files: r.files,
      size: r.size,
      lastAnalyzed: r.lastAnalyzedAt
        ? new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
            Math.round(
              (r.lastAnalyzedAt.getTime() - Date.now()) / (1000 * 60 * 60),
            ),
            "hour",
          )
        : "never",
      status: r.status as RepoSummary["status"],
      health: r.health,
      debt: r.debt,
      coverage: r.coverage,
      description: r.description,
    }));
  },
);

/**
 * Get a single repository by ID.
 */
export const getRepoById = createServerFn({ method: "GET" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }): Promise<RepoSummary | null> => {
    if (!process.env["DATABASE_URL"]) {
      const found = mockRepos.find((r) => r.id === data.id);
      return found ? toSummary(found) : null;
    }

    const { getDb } = await import("@/db/client");
    const { repositories } = await import("@/db/schema");
    const db = getDb();

    const [row] = await db
      .select()
      .from(repositories)
      .where(eq(repositories.id, data.id))
      .limit(1);

    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      org: row.org,
      stars: row.stars,
      language: row.language,
      files: row.files,
      size: row.size,
      lastAnalyzed: row.lastAnalyzedAt
        ? new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
            Math.round(
              (row.lastAnalyzedAt.getTime() - Date.now()) / (1000 * 60 * 60),
            ),
            "hour",
          )
        : "never",
      status: row.status as RepoSummary["status"],
      health: row.health,
      debt: row.debt,
      coverage: row.coverage,
      description: row.description,
    };
  });

/**
 * Create a new repository record (called after analysis kicks off).
 */
export const createRepo = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      userId: z.string(),
      name: z.string(),
      org: z.string(),
      githubUrl: z.string().url().optional(),
      language: z.string().default("Unknown"),
    }),
  )
  .handler(async ({ data }) => {
    if (!process.env["DATABASE_URL"]) {
      // In mock mode, just return a fake ID
      return { id: `${data.org}-${data.name}`.toLowerCase().replace(/\s+/g, "-") };
    }

    const { getDb } = await import("@/db/client");
    const { repositories } = await import("@/db/schema");
    const db = getDb();

    const id = `${data.org}-${data.name}`.toLowerCase().replace(/\s+/g, "-");

    await db.insert(repositories).values({
      id,
      userId: data.userId,
      name: data.name,
      org: data.org,
      githubUrl: data.githubUrl,
      language: data.language,
      status: "pending",
    });

    return { id };
  });

/**
 * Get architecture graph for a repository
 */
export const getRepoArchitecture = createServerFn({ method: "GET" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    // In a real implementation, this would query a graph DB or parsed AST results
    // For now, we return a mock structure shaped around the repo ID
    return {
      nodes: [
        { id: "client", label: "Client", x: 80, y: 60, color: "primary" },
        { id: "gateway", label: "API Gateway", x: 280, y: 60 },
        { id: "auth", label: "Auth Service", x: 480, y: 30 },
        { id: "payments", label: "Payments", x: 480, y: 110 },
        { id: "external", label: "External API", x: 680, y: 110, color: "accent" },
        { id: "db", label: "Database", x: 480, y: 220 },
        { id: "queue", label: "Job Queue", x: 280, y: 220 },
        { id: "worker", label: "Worker", x: 80, y: 220 },
      ],
      edges: [
        ["client", "gateway"],
        ["gateway", "auth"],
        ["gateway", "payments"],
        ["payments", "external"],
        ["payments", "db"],
        ["auth", "db"],
        ["gateway", "queue"],
        ["queue", "worker"],
        ["worker", "db"],
      ] as [string, string][],
      layers: [
        { name: "Transport", count: 14 },
        { name: "Domain", count: 38 },
        { name: "Persistence", count: 12 },
        { name: "External", count: 4 },
      ],
      hotPaths: [
        "POST /checkout → Payments → External",
        "POST /webhooks → Worker → DB",
        "GET /me → Auth → DB",
      ]
    };
  });

