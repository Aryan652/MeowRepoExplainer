import postgres from 'postgres';
const sql = postgres('postgresql://postgres.cydxivstmpdxunhtzzfc:CcHPow5n7xxlYyXj@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres');
(async () => {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS "code_embeddings" (
        "id" text PRIMARY KEY NOT NULL,
        "repository_id" text NOT NULL,
        "file_path" text NOT NULL,
        "function_name" text,
        "content" text NOT NULL,
        "embedding" vector(1536),
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `;
    
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'code_embeddings_repository_id_repositories_id_fk'
        ) THEN
          ALTER TABLE "code_embeddings" ADD CONSTRAINT "code_embeddings_repository_id_repositories_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repositories"("id") ON DELETE cascade ON UPDATE no action;
        END IF;
      END
      $$;
    `;
    console.log('code_embeddings table created!');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
})();
