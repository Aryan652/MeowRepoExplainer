/**
 * src/db/schema.ts
 *
 * Drizzle ORM schema — single source of truth for the database.
 * Run `npx drizzle-kit push` to apply this schema to your Supabase/Postgres instance.
 */

import {
  pgTable,
  text,
  integer,
  real,
  timestamp,
  pgEnum,
  vector,
} from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const analysisStatusEnum = pgEnum("analysis_status", [
  "pending",
  "analyzing",
  "ready",
  "error",
]);

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  avatarUrl: text("avatar_url"),
  provider: text("provider").notNull().default("email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Repositories ─────────────────────────────────────────────────────────────

export const repositories = pgTable("repositories", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  org: text("org").notNull(),
  githubUrl: text("github_url"),
  language: text("language").notNull().default("Unknown"),
  stars: text("stars").notNull().default("—"),
  files: integer("files").notNull().default(0),
  size: text("size").notNull().default("—"),
  status: analysisStatusEnum("status").notNull().default("pending"),
  health: real("health").notNull().default(0),
  debt: integer("debt").notNull().default(0),
  coverage: real("coverage").notNull().default(0),
  description: text("description").notNull().default(""),
  lastAnalyzedAt: timestamp("last_analyzed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Analysis Jobs ─────────────────────────────────────────────────────────────

export const analysisJobs = pgTable("analysis_jobs", {
  id: text("id").primaryKey(),
  repositoryId: text("repository_id")
    .notNull()
    .references(() => repositories.id, { onDelete: "cascade" }),
  step: text("step").notNull().default("cloning"),
  progress: integer("progress").notNull().default(0),
  logs: text("logs").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  finishedAt: timestamp("finished_at"),
});

// ─── Tech Debt Items ────────────────────────────────────────────────────────────

export const techDebtItems = pgTable("tech_debt_items", {
  id: text("id").primaryKey(),
  repositoryId: text("repository_id")
    .notNull()
    .references(() => repositories.id, { onDelete: "cascade" }),
  severity: text("severity").notNull(), // "high" | "med" | "low"
  title: text("title").notNull(),
  path: text("path").notNull(),
  note: text("note").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Code Embeddings ────────────────────────────────────────────────────────────

export const codeEmbeddings = pgTable("code_embeddings", {
  id: text("id").primaryKey(),
  repositoryId: text("repository_id")
    .notNull()
    .references(() => repositories.id, { onDelete: "cascade" }),
  filePath: text("file_path").notNull(),
  functionName: text("function_name"),
  content: text("content").notNull(),
  embedding: vector("embedding", { dimensions: 1536 }), // OpenAI text-embedding-3-small
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Repository Documentation ───────────────────────────────────────────────────

export const repositoryDocs = pgTable("repository_docs", {
  id: text("id").primaryKey(),
  repositoryId: text("repository_id")
    .notNull()
    .references(() => repositories.id, { onDelete: "cascade" }),
  docType: text("doc_type").notNull(), // "readme", "api", "onboarding", "architecture"
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Inferred Types ─────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Repository = typeof repositories.$inferSelect;
export type NewRepository = typeof repositories.$inferInsert;
export type AnalysisJob = typeof analysisJobs.$inferSelect;
export type TechDebtItem = typeof techDebtItems.$inferSelect;
export type CodeEmbedding = typeof codeEmbeddings.$inferSelect;
export type RepositoryDoc = typeof repositoryDocs.$inferSelect;
