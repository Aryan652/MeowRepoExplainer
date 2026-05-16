/**
 * src/db/client.ts
 *
 * Drizzle client wired to Supabase's postgres connection string.
 *
 * Setup:
 *   1. Create a project at https://supabase.com
 *   2. Copy the "Transaction pooler" connection string from:
 *      Project → Settings → Database → Connection string → Transaction
 *   3. Add it to your .dev.vars file:
 *        DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
 *   4. Also add the Supabase anon key for client-side realtime:
 *        SUPABASE_URL=https://[ref].supabase.co
 *        SUPABASE_ANON_KEY=your-anon-key
 *   5. Run `npx drizzle-kit push` to create tables.
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// ─── DB singleton (server-only) ───────────────────────────────────────────────

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (_db) return _db;

  const url = process.env["DATABASE_URL"];
  if (!url) {
    throw new Error(
      "[RepoMind] DATABASE_URL is not set. " +
        "Add it to .dev.vars for local dev, or to Cloudflare dashboard for production.",
    );
  }

  const client = postgres(url, { max: 1 });
  _db = drizzle(client, { schema });
  return _db;
}

// ─── Supabase client (client-side auth helpers) ───────────────────────────────

import { createClient } from "@supabase/supabase-js";

let _supabase: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (_supabase) return _supabase;

  const url = process.env["SUPABASE_URL"] ?? import.meta.env?.["VITE_SUPABASE_URL"] ?? "";
  const key = process.env["SUPABASE_ANON_KEY"] ?? import.meta.env?.["VITE_SUPABASE_ANON_KEY"] ?? "";

  if (!url || !key) {
    console.warn("[RepoMind] Supabase env vars not set — Supabase client disabled.");
    return null;
  }

  _supabase = createClient(url, key);
  return _supabase;
}
