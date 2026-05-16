CREATE TYPE "public"."analysis_status" AS ENUM('pending', 'analyzing', 'ready', 'error');--> statement-breakpoint
CREATE TABLE "analysis_jobs" (
	"id" text PRIMARY KEY NOT NULL,
	"repository_id" text NOT NULL,
	"step" text DEFAULT 'cloning' NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"logs" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"finished_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "code_embeddings" (
	"id" text PRIMARY KEY NOT NULL,
	"repository_id" text NOT NULL,
	"file_path" text NOT NULL,
	"function_name" text,
	"content" text NOT NULL,
	"embedding" vector(1536),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "repositories" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"org" text NOT NULL,
	"github_url" text,
	"language" text DEFAULT 'Unknown' NOT NULL,
	"stars" text DEFAULT '—' NOT NULL,
	"files" integer DEFAULT 0 NOT NULL,
	"size" text DEFAULT '—' NOT NULL,
	"status" "analysis_status" DEFAULT 'pending' NOT NULL,
	"health" real DEFAULT 0 NOT NULL,
	"debt" integer DEFAULT 0 NOT NULL,
	"coverage" real DEFAULT 0 NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"last_analyzed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tech_debt_items" (
	"id" text PRIMARY KEY NOT NULL,
	"repository_id" text NOT NULL,
	"severity" text NOT NULL,
	"title" text NOT NULL,
	"path" text NOT NULL,
	"note" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"avatar_url" text,
	"provider" text DEFAULT 'email' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "analysis_jobs" ADD CONSTRAINT "analysis_jobs_repository_id_repositories_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repositories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "code_embeddings" ADD CONSTRAINT "code_embeddings_repository_id_repositories_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repositories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repositories" ADD CONSTRAINT "repositories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tech_debt_items" ADD CONSTRAINT "tech_debt_items_repository_id_repositories_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repositories"("id") ON DELETE cascade ON UPDATE no action;