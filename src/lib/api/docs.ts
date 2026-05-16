/**
 * src/lib/api/docs.ts
 *
 * Server functions for repository documentation
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { eq } from "drizzle-orm";

export const getRepoDocs = createServerFn({ method: "GET" })
  .inputValidator(
    z.object({
      repoId: z.string(),
    })
  )
  .handler(async ({ data }) => {
    if (!process.env["DATABASE_URL"]) {
      // Return empty array if no database
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
    }));
  });

// Made with Bob
