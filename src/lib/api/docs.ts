/**
 * src/lib/api/docs.ts
 *
 * Server functions for repository documentation
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { documentationAgent, DocumentationResult } from "@/agents/documentation.agent";
import { createLogger } from "@/lib/logger";

const logger = createLogger("DocsAPI");

/**
 * Get repository documentation
 */
export const getRepoDocs = createServerFn({ method: "GET" })
  .inputValidator(
    z.object({
      repoId: z.string(),
    })
  )
  .handler(async ({ data }) => {
    if (!process.env["DATABASE_URL"]) {
      return [];
    }

    const { getDb } = await import("@/db/client");
    const { repositoryDocs } = await import("@/db/schema");
    const db = getDb();

    const docs = await db
      .select()
      .from(repositoryDocs)
      .where(eq(repositoryDocs.repositoryId, data.repoId));

    return docs.map((doc) => ({
      id: doc.id,
      docType: doc.docType,
      title: doc.title,
      content: doc.content,
      createdAt: doc.createdAt,
    }));
  });

/**
 * Generate documentation for a repository
 */
export const generateRepoDocs = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      repoId: z.string(),
    })
  )
  .handler(async ({ data }) => {
    if (!process.env["DATABASE_URL"]) {
      throw new Error("Database not configured");
    }

    const { getDb } = await import("@/db/client");
    const { repositories, repositoryDocs } = await import("@/db/schema");
    const db = getDb();

    logger.info(`Starting documentation generation for repo: ${data.repoId}`);

    // 1. Validate repository exists
    const repo = await db
      .select()
      .from(repositories)
      .where(eq(repositories.id, data.repoId))
      .limit(1);

    if (!repo || repo.length === 0) {
      logger.error(`Repository not found: ${data.repoId}`);
      throw new Error("Repository not found");
    }

    const repository = repo[0];

    // Validate repository has necessary GitHub information
    if (!repository.githubUrl && (!repository.org || !repository.name)) {
      logger.error(`Repository missing GitHub information`, {
        repoId: data.repoId,
        hasGithubUrl: !!repository.githubUrl,
        hasOrg: !!repository.org,
        hasName: !!repository.name,
      });
      throw new Error(
        "Repository does not have valid GitHub URL or organization/name. Please ensure the repository is properly configured."
      );
    }

    // 2. Check if documentation generation is already in progress
    const existingDocs = await db
      .select()
      .from(repositoryDocs)
      .where(eq(repositoryDocs.repositoryId, data.repoId));

    const recentDocs = existingDocs.filter((doc) => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      return doc.createdAt && doc.createdAt > fiveMinutesAgo;
    });

    if (recentDocs.length > 0 && recentDocs.some(d => d.content.includes("⏳ Generating"))) {
      logger.warn(`Documentation generation already in progress for: ${data.repoId}`);
      return {
        success: false,
        message: "Documentation generation already in progress",
        status: "in_progress",
      };
    }

    // 3. Delete existing docs to regenerate
    if (existingDocs.length > 0) {
      await db
        .delete(repositoryDocs)
        .where(eq(repositoryDocs.repositoryId, data.repoId));
      logger.info(`Deleted ${existingDocs.length} existing docs`);
    }

    // 4. Create pending entries
    const jobId = nanoid();
    const pendingDocs = [
      { type: "readme", title: "README.md" },
      { type: "api", title: "API Reference" },
      { type: "onboarding", title: "Onboarding Guide" },
      { type: "architecture", title: "Architecture Notes" },
    ];

    try {
      // Insert pending docs
      for (const doc of pendingDocs) {
        await db.insert(repositoryDocs).values({
          id: nanoid(),
          repositoryId: data.repoId,
          docType: doc.type,
          title: doc.title,
          content: "⏳ Generating documentation...",
          createdAt: new Date(),
        });
      }

      logger.info(`Created ${pendingDocs.length} pending doc entries`);

      // 5. Execute documentation agent asynchronously
      setImmediate(async () => {
        try {
          logger.info(`Executing documentation agent for: ${data.repoId}`);

          // Construct proper GitHub repository identifier
          let repositoryName: string;
          if (repository.githubUrl) {
            repositoryName = repository.githubUrl;
          } else if (repository.org && repository.name) {
            // Format as owner/repo for GitHub API
            repositoryName = `${repository.org}/${repository.name}`;
          } else {
            throw new Error("Repository does not have valid GitHub URL or org/name");
          }

          logger.info(`Using repository identifier: ${repositoryName}`);

          const agentResult = await documentationAgent.execute({
            repositoryId: data.repoId,
            repositoryName: repositoryName,
            language: repository.language,
          });

          if (agentResult.success && agentResult.data) {
            const docResult = agentResult.data as DocumentationResult;

            // Update README
            await db
              .update(repositoryDocs)
              .set({
                content: docResult.readme,
                title: "README.md",
              })
              .where(
                and(
                  eq(repositoryDocs.repositoryId, data.repoId),
                  eq(repositoryDocs.docType, "readme")
                )
              );

            // Update API docs
            const apiContent = docResult.apiDocs.join("\n\n---\n\n");
            await db
              .update(repositoryDocs)
              .set({
                content: apiContent || "No API documentation generated.",
                title: "API Reference",
              })
              .where(
                and(
                  eq(repositoryDocs.repositoryId, data.repoId),
                  eq(repositoryDocs.docType, "api")
                )
              );

            // Update Setup/Onboarding Guide
            await db
              .update(repositoryDocs)
              .set({
                content: docResult.setupGuide,
                title: "Setup & Onboarding Guide",
              })
              .where(
                and(
                  eq(repositoryDocs.repositoryId, data.repoId),
                  eq(repositoryDocs.docType, "onboarding")
                )
              );

            // Update Architecture
            await db
              .update(repositoryDocs)
              .set({
                content: docResult.architecture,
                title: "Architecture Documentation",
              })
              .where(
                and(
                  eq(repositoryDocs.repositoryId, data.repoId),
                  eq(repositoryDocs.docType, "architecture")
                )
              );

            logger.info(`Successfully generated documentation for: ${data.repoId}`);
          } else {
            // Update all docs with error message
            const errorMessage = `❌ Documentation generation failed: ${agentResult.error || "Unknown error"}`;
            
            for (const doc of pendingDocs) {
              await db
                .update(repositoryDocs)
                .set({ content: errorMessage })
                .where(
                  and(
                    eq(repositoryDocs.repositoryId, data.repoId),
                    eq(repositoryDocs.docType, doc.type)
                  )
                );
            }

            logger.error(`Documentation generation failed for: ${data.repoId}`, {
              error: agentResult.error,
            });
          }
        } catch (error) {
          logger.error(`Error in async documentation generation`, error);
          
          // Update all docs with error
          const errorMessage = `❌ Error: ${error instanceof Error ? error.message : String(error)}`;
          for (const doc of pendingDocs) {
            try {
              await db
                .update(repositoryDocs)
                .set({ content: errorMessage })
                .where(
                  and(
                    eq(repositoryDocs.repositoryId, data.repoId),
                    eq(repositoryDocs.docType, doc.type)
                  )
                );
            } catch (updateError) {
              logger.error(`Failed to update doc with error message`, updateError);
            }
          }
        }
      });

      // 6. Return success response immediately
      return {
        success: true,
        message: "Documentation generation started",
        jobId,
        status: "started",
      };
    } catch (error) {
      logger.error(`Failed to start documentation generation`, error);
      throw new Error(
        `Failed to start documentation generation: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  });

/**
 * Check documentation generation status
 */
export const getDocsGenerationStatus = createServerFn({ method: "GET" })
  .inputValidator(
    z.object({
      repoId: z.string(),
    })
  )
  .handler(async ({ data }) => {
    if (!process.env["DATABASE_URL"]) {
      return { status: "unknown", docs: [] };
    }

    const { getDb } = await import("@/db/client");
    const { repositoryDocs } = await import("@/db/schema");
    const db = getDb();

    const docs = await db
      .select()
      .from(repositoryDocs)
      .where(eq(repositoryDocs.repositoryId, data.repoId));

    if (docs.length === 0) {
      return { status: "not_started", docs: [] };
    }

    const hasGenerating = docs.some((d) => d.content.includes("⏳ Generating"));
    const hasError = docs.some((d) => d.content.includes("❌"));
    
    let status: "generating" | "completed" | "error" | "not_started" = "not_started";
    
    if (hasGenerating) {
      status = "generating";
    } else if (hasError) {
      status = "error";
    } else if (docs.length > 0) {
      status = "completed";
    }

    return {
      status,
      docs: docs.map((d) => ({
        docType: d.docType,
        title: d.title,
        hasContent: d.content.length > 50,
      })),
    };
  });

// Made with Bob
