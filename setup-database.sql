-- Setup script for RepoMind AI database
-- Run this in your Supabase SQL editor

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create enum for analysis status
DO $$ BEGIN
    CREATE TYPE analysis_status AS ENUM ('pending', 'analyzing', 'ready', 'error');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    avatar_url TEXT,
    provider TEXT NOT NULL DEFAULT 'email',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create repositories table
CREATE TABLE IF NOT EXISTS repositories (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    org TEXT NOT NULL,
    github_url TEXT,
    language TEXT NOT NULL DEFAULT 'Unknown',
    stars TEXT NOT NULL DEFAULT '—',
    files INTEGER NOT NULL DEFAULT 0,
    size TEXT NOT NULL DEFAULT '—',
    status analysis_status NOT NULL DEFAULT 'pending',
    health REAL NOT NULL DEFAULT 0,
    debt INTEGER NOT NULL DEFAULT 0,
    coverage REAL NOT NULL DEFAULT 0,
    description TEXT NOT NULL DEFAULT '',
    last_analyzed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create analysis_jobs table
CREATE TABLE IF NOT EXISTS analysis_jobs (
    id TEXT PRIMARY KEY,
    repository_id TEXT NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    step TEXT NOT NULL DEFAULT 'cloning',
    progress INTEGER NOT NULL DEFAULT 0,
    logs TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    finished_at TIMESTAMP
);

-- Create tech_debt_items table
CREATE TABLE IF NOT EXISTS tech_debt_items (
    id TEXT PRIMARY KEY,
    repository_id TEXT NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    severity TEXT NOT NULL,
    title TEXT NOT NULL,
    path TEXT NOT NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create code_embeddings table
CREATE TABLE IF NOT EXISTS code_embeddings (
    id TEXT PRIMARY KEY,
    repository_id TEXT NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    function_name TEXT,
    content TEXT NOT NULL,
    embedding vector(1536),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create repository_docs table
CREATE TABLE IF NOT EXISTS repository_docs (
    id TEXT PRIMARY KEY,
    repository_id TEXT NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    doc_type TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_repositories_user_id ON repositories(user_id);
CREATE INDEX IF NOT EXISTS idx_repositories_status ON repositories(status);
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_repository_id ON analysis_jobs(repository_id);
CREATE INDEX IF NOT EXISTS idx_tech_debt_items_repository_id ON tech_debt_items(repository_id);
CREATE INDEX IF NOT EXISTS idx_code_embeddings_repository_id ON code_embeddings(repository_id);
CREATE INDEX IF NOT EXISTS idx_repository_docs_repository_id ON repository_docs(repository_id);
CREATE INDEX IF NOT EXISTS idx_repository_docs_doc_type ON repository_docs(doc_type);

-- Create index for vector similarity search (using cosine distance)
CREATE INDEX IF NOT EXISTS idx_code_embeddings_vector ON code_embeddings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Insert a test user (optional)
INSERT INTO users (id, name, email, provider)
VALUES ('test-user-1', 'Test User', 'test@repomind.ai', 'email')
ON CONFLICT (id) DO NOTHING;

-- Verify tables were created
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN ('users', 'repositories', 'analysis_jobs', 'tech_debt_items', 'code_embeddings')
ORDER BY table_name;

-- Made with Bob
