CREATE TABLE "repository_docs" (
	"id" text PRIMARY KEY NOT NULL,
	"repository_id" text NOT NULL,
	"doc_type" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "repository_docs" ADD CONSTRAINT "repository_docs_repository_id_repositories_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repositories"("id") ON DELETE cascade ON UPDATE no action;