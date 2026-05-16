# Project Implementation Tasks (TODO)

This document breaks down the development of RepoMind AI into manageable, feature-specific tasks, moving from the current mock-based frontend to a fully functional, AI-powered full-stack application.

## Phase 1: Authentication & User Management
- [x] **Select Auth Provider:** Choose and configure an authentication provider (e.g., Supabase, Clerk, or Auth0).
- [x] **Auth Pages Integration:** Wire up the existing `login.tsx` and `signup.tsx` routes with the real authentication provider logic.
- [x] **Route Protection:** Implement authentication middleware in TanStack Router to protect the `/dashboard` and `/repo/*` routes.
- [x] **GitHub OAuth Integration:** Configure GitHub login to seamlessly request repository read permissions from the user.

## Phase 2: Database Setup & Backend Foundation
- [x] **Database Setup:** Provision a PostgreSQL database (e.g., Supabase, Neon) for storing users, workspaces, and repository metadata.
- [x] **Schema Definition:** Define the schema for `Users`, `Repositories`, `AnalysisJobs`, and `TechDebtItems`.
- [x] **ORM Configuration:** Integrate an ORM (like Drizzle or Prisma) and set up initial migrations.
- [x] **API Endpoints for Dashboard:** Create server functions/API endpoints to serve real user repositories, replacing `src/lib/mock-data.ts`.
- [x] **Dynamic Data Wiring:** Update the `Dashboard` component to fetch and render the live repository data using TanStack Query.

## Phase 3: The Analysis Engine Pipeline
- [x] **Repository Ingestion Service:** Implement a backend service to clone repositories or download zip archives using the GitHub API.
- [x] **File System & Language Detection:** Build utilities to traverse the ingested codebase, count files, and detect primary languages/frameworks.
- [x] **AST Parsing:** Integrate a tool like Tree-sitter to parse the code, extract symbols, and determine module dependencies.
- [x] **Progress Streaming:** Update the `/analyze` route to stream real progress updates from the backend via WebSockets or Server-Sent Events (SSE) during the analysis steps.
- [x] **Architecture Graph Generation:** Map the parsed dependencies into the JSON structure required by the `ArchitecturePage` visualization.

## Phase 4: Vector Database & Semantic Search
- [x] **Vector DB Provisioning:** Set up a Vector Database (e.g., Pinecone, Weaviate, or pgvector).
- [x] **Embedding Generation Pipeline:** Build a worker script to chunk codebase files and generate vector embeddings using an LLM (e.g., OpenAI `text-embedding-3-small`).
- [x] **Data Ingestion:** Store the generated embeddings in the Vector DB, mapping them strictly to file paths and line numbers.

## Phase 5: Multi-Agent AI & Chat UI Integration
- [ ] **LLM Integration:** Set up the chosen LLM API (Anthropic, OpenAI, or Groq) in the Cloudflare backend.
- [ ] **Agent Prompts Configuration:** Define the system prompts for the specialized agents (Documentation, Security, Architecture, Refactor).
- [ ] **RAG Implementation for Chat:** Build the Retrieval-Augmented Generation (RAG) backend logic to search the Vector DB based on user queries and feed the context to the LLM.
- [ ] **Wire up Chat UI:** Connect the `repo.$repoId.chat.tsx` interface to the real RAG backend. Ensure UI citations map correctly to actual files.

## Phase 6: Final Polish & Production Deployment
- [ ] **Remove Mock Data:** Audit the codebase and remove the last remnants of `mock-data.ts`.
- [ ] **Environment Variables:** Securely configure all API keys, database URLs, and secrets in `wrangler.jsonc` (for dev) and Cloudflare dashboard (for prod).
- [ ] **End-to-End Testing:** Test the full analysis pipeline from user signup -> repository ingestion -> codebase querying.
- [ ] **Deploy to Production:** Perform the final build and deploy to Cloudflare Pages & Workers.

## Phase 7: GitHub Integration & CodeRabbit

### 7.1 GitHub Repository Setup
- [ ] **Initialize Remote Repository:** Create a new repository on GitHub for the project.
- [ ] **Branch Strategy:** Set up a branching strategy: `main` (production), `dev` (staging), and feature branches (`feature/*`).
- [ ] **Push Initial Codebase:** Commit and push the current codebase to the `main` branch.
- [ ] **Configure `.gitignore`:** Verify the `.gitignore` includes all environment files (`.env`, `.dev.vars`), build artifacts (`dist/`), and sensitive configs.
- [ ] **Branch Protection Rules:** Enable branch protection on `main` to require PR reviews before merging.

### 7.2 CodeRabbit Integration
- [ ] **Install CodeRabbit:** Go to [coderabbit.ai](https://coderabbit.ai) and install the CodeRabbit GitHub App on the repository.
- [ ] **Configure CodeRabbit:** Create a `.coderabbit.yaml` config file in the project root to customize review preferences (e.g., language, review tone, paths to ignore).
- [ ] **Open a Test PR:** Create a test pull request from `dev` → `main` to verify that CodeRabbit automatically posts an AI-powered code review.
- [ ] **Security Scan Verification:** Confirm that CodeRabbit flags hardcoded secrets, unsafe patterns, and security vulnerabilities in the PR review.
- [ ] **Code Quality Gates:** Configure CodeRabbit to enforce rules for TypeScript type safety, unused code, and adherence to the `TECH_STACK.md` guidelines.
- [ ] **Team Onboarding:** Add collaborators to the GitHub repository and ensure all team members understand the PR + CodeRabbit review workflow.
