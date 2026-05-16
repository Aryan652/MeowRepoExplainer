# RepoMind AI - Detailed Directory Structure

This document provides a comprehensive breakdown of the project's directory structure with explanations for each component.

---

## Complete Directory Tree

```
repomind-ai/
├── frontend/                          # Next.js frontend application
│   ├── src/
│   │   ├── app/                      # Next.js 14 App Router
│   │   │   ├── (auth)/              # Authentication routes group
│   │   │   │   ├── login/
│   │   │   │   │   └── page.tsx     # Login page
│   │   │   │   ├── signup/
│   │   │   │   │   └── page.tsx     # Signup page
│   │   │   │   └── layout.tsx       # Auth layout
│   │   │   ├── (dashboard)/         # Main application routes group
│   │   │   │   ├── repositories/
│   │   │   │   │   ├── page.tsx     # Repository list
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   └── page.tsx # Repository detail
│   │   │   │   │   └── new/
│   │   │   │   │       └── page.tsx # Upload repository
│   │   │   │   ├── chat/
│   │   │   │   │   ├── page.tsx     # Chat interface
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx # Chat with specific repo
│   │   │   │   ├── documentation/
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx # Generated docs view
│   │   │   │   ├── architecture/
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx # Architecture visualization
│   │   │   │   ├── settings/
│   │   │   │   │   └── page.tsx     # User settings
│   │   │   │   └── layout.tsx       # Dashboard layout
│   │   │   ├── api/                 # API routes (Next.js API)
│   │   │   │   └── auth/
│   │   │   │       └── [...nextauth]/
│   │   │   │           └── route.ts # NextAuth configuration
│   │   │   ├── layout.tsx           # Root layout
│   │   │   ├── page.tsx             # Landing page
│   │   │   └── globals.css          # Global styles
│   │   ├── components/              # React components
│   │   │   ├── ui/                  # Base UI components (Radix)
│   │   │   │   ├── button.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── dropdown.tsx
│   │   │   │   └── ...
│   │   │   ├── chat/                # Chat interface components
│   │   │   │   ├── ChatInterface.tsx
│   │   │   │   ├── MessageList.tsx
│   │   │   │   ├── MessageInput.tsx
│   │   │   │   ├── CodeBlock.tsx
│   │   │   │   └── CitationCard.tsx
│   │   │   ├── visualization/       # D3.js, React Flow components
│   │   │   │   ├── DependencyGraph.tsx
│   │   │   │   ├── ArchitectureDiagram.tsx
│   │   │   │   ├── ComplexityHeatmap.tsx
│   │   │   │   └── ServiceMap.tsx
│   │   │   ├── code/                # Monaco editor components
│   │   │   │   ├── CodeEditor.tsx
│   │   │   │   ├── CodeViewer.tsx
│   │   │   │   └── DiffViewer.tsx
│   │   │   ├── layout/              # Layout components
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   └── Navigation.tsx
│   │   │   └── repository/          # Repository components
│   │   │       ├── RepositoryCard.tsx
│   │   │       ├── RepositoryList.tsx
│   │   │       ├── UploadForm.tsx
│   │   │       └── StatusBadge.tsx
│   │   ├── lib/                     # Utility libraries
│   │   │   ├── api-client.ts        # API client with axios
│   │   │   ├── websocket.ts         # WebSocket client
│   │   │   ├── utils.ts             # General utilities
│   │   │   └── constants.ts         # Constants
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useRepository.ts
│   │   │   ├── useChat.ts
│   │   │   ├── useWebSocket.ts
│   │   │   └── useDebounce.ts
│   │   ├── stores/                  # Zustand stores
│   │   │   ├── authStore.ts
│   │   │   ├── repositoryStore.ts
│   │   │   ├── chatStore.ts
│   │   │   └── uiStore.ts
│   │   └── types/                   # TypeScript types
│   │       ├── api.ts
│   │       ├── repository.ts
│   │       ├── query.ts
│   │       └── user.ts
│   ├── public/                      # Static assets
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── next.config.js
│   ├── .eslintrc.json
│   └── .prettierrc
│
├── backend/                          # FastAPI backend application
│   ├── src/
│   │   ├── api/                     # API layer
│   │   │   ├── v1/                  # API version 1
│   │   │   │   ├── endpoints/
│   │   │   │   │   ├── auth.py      # Authentication endpoints
│   │   │   │   │   ├── repositories.py  # Repository CRUD
│   │   │   │   │   ├── queries.py   # Query processing
│   │   │   │   │   ├── agents.py    # Agent management
│   │   │   │   │   └── documentation.py  # Documentation endpoints
│   │   │   │   ├── dependencies.py  # Dependency injection
│   │   │   │   └── router.py        # API router
│   │   │   └── websocket/           # WebSocket handlers
│   │   │       └── chat.py          # Chat WebSocket
│   │   ├── core/                    # Core business logic
│   │   │   ├── config.py            # Configuration management
│   │   │   ├── security.py          # Authentication/authorization
│   │   │   ├── logging.py           # Logging configuration
│   │   │   └── exceptions.py        # Custom exceptions
│   │   ├── services/                # Business logic services
│   │   │   ├── repository_service.py    # Repository operations
│   │   │   ├── query_service.py         # Query processing
│   │   │   ├── embedding_service.py     # Embedding generation
│   │   │   ├── documentation_service.py # Doc generation
│   │   │   └── visualization_service.py # Visualization generation
│   │   ├── agents/                  # AI Agent implementations
│   │   │   ├── base.py              # Base agent class
│   │   │   ├── orchestrator.py      # Agent orchestrator
│   │   │   ├── documentation_agent.py
│   │   │   ├── security_agent.py
│   │   │   ├── refactor_agent.py
│   │   │   ├── testing_agent.py
│   │   │   └── architecture_agent.py
│   │   ├── parsers/                 # Code parsers
│   │   │   ├── base_parser.py       # Base parser interface
│   │   │   ├── python_parser.py
│   │   │   ├── javascript_parser.py
│   │   │   ├── typescript_parser.py
│   │   │   ├── java_parser.py
│   │   │   ├── go_parser.py
│   │   │   ├── rust_parser.py
│   │   │   └── cpp_parser.py
│   │   ├── rag/                     # RAG pipeline
│   │   │   ├── retriever.py         # Hybrid retrieval
│   │   │   ├── embedder.py          # Embedding generation
│   │   │   ├── compressor.py        # Context compression
│   │   │   └── generator.py         # Response generation
│   │   ├── models/                  # Data models (Pydantic)
│   │   │   ├── user.py
│   │   │   ├── repository.py
│   │   │   ├── query.py
│   │   │   ├── agent.py
│   │   │   └── code_element.py
│   │   ├── db/                      # Database layer
│   │   │   ├── base.py              # Base repository
│   │   │   ├── session.py           # Database session
│   │   │   ├── repositories/        # Data repositories
│   │   │   │   ├── user_repository.py
│   │   │   │   ├── repository_repository.py
│   │   │   │   └── query_repository.py
│   │   │   └── migrations/          # Alembic migrations
│   │   │       ├── versions/
│   │   │       ├── env.py
│   │   │       └── script.py.mako
│   │   ├── vector_store/            # Vector database
│   │   │   ├── chromadb_client.py
│   │   │   └── operations.py
│   │   ├── cache/                   # Redis cache
│   │   │   └── redis_client.py
│   │   └── utils/                   # Utility functions
│   │       ├── ast_utils.py
│   │       ├── dependency_graph.py
│   │       ├── metrics.py
│   │       └── file_utils.py
│   ├── tests/                       # Test suite
│   │   ├── unit/
│   │   │   ├── test_agents/
│   │   │   ├── test_parsers/
│   │   │   ├── test_services/
│   │   │   └── test_rag/
│   │   ├── integration/
│   │   │   ├── test_api/
│   │   │   ├── test_db/
│   │   │   └── test_agents/
│   │   ├── e2e/
│   │   │   └── test_workflows/
│   │   ├── fixtures/
│   │   │   └── sample_repos/
│   │   └── conftest.py
│   ├── config/
│   │   ├── default.yaml
│   │   ├── development.yaml
│   │   ├── production.yaml
│   │   └── test.yaml
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   ├── pyproject.toml
│   ├── setup.py
│   └── main.py                      # Application entry point
│
├── agents/                           # Standalone agent services (optional microservices)
│   ├── documentation/
│   │   ├── src/
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   ├── security/
│   │   ├── src/
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   ├── refactor/
│   │   ├── src/
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   ├── testing/
│   │   ├── src/
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   └── architecture/
│       ├── src/
│       ├── Dockerfile
│       └── requirements.txt
│
├── shared/                           # Shared code between services
│   ├── types/                       # Shared TypeScript/Python types
│   │   ├── typescript/
│   │   └── python/
│   ├── constants/
│   │   └── common.py
│   └── utils/
│       └── common.py
│
├── infrastructure/                   # Infrastructure as Code
│   ├── kubernetes/                  # K8s manifests
│   │   ├── deployments/
│   │   │   ├── frontend.yaml
│   │   │   ├── backend.yaml
│   │   │   ├── chromadb.yaml
│   │   │   └── redis.yaml
│   │   ├── services/
│   │   │   ├── frontend-service.yaml
│   │   │   ├── backend-service.yaml
│   │   │   └── chromadb-service.yaml
│   │   ├── ingress/
│   │   │   └── ingress.yaml
│   │   ├── configmaps/
│   │   │   └── app-config.yaml
│   │   └── secrets/
│   │       └── app-secrets.yaml
│   ├── terraform/                   # Terraform configs
│   │   ├── aws/
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   └── outputs.tf
│   │   ├── gcp/
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   └── outputs.tf
│   │   └── ibm-cloud/
│   │       ├── main.tf
│   │       ├── variables.tf
│   │       └── outputs.tf
│   └── docker/                      # Dockerfiles
│       ├── frontend.Dockerfile
│       ├── backend.Dockerfile
│       ├── agent.Dockerfile
│       └── docker-compose.yml
│
├── scripts/                          # Utility scripts
│   ├── setup.sh                     # Local setup script
│   ├── seed_data.py                 # Database seeding
│   ├── migrate.sh                   # Database migration
│   ├── deploy.sh                    # Deployment script
│   ├── backup.sh                    # Backup script
│   └── test.sh                      # Test runner
│
├── docs/                            # Documentation
│   ├── architecture/
│   │   ├── system-architecture.md
│   │   ├── directory-structure.md
│   │   ├── data-models.md
│   │   ├── rag-pipeline.md
│   │   └── performance-optimization.md
│   ├── api/
│   │   ├── rest-api.md
│   │   ├── websocket-api.md
│   │   └── graphql-api.md
│   ├── agents/
│   │   ├── documentation-agent.md
│   │   ├── security-agent.md
│   │   ├── refactor-agent.md
│   │   ├── testing-agent.md
│   │   └── architecture-agent.md
│   ├── deployment/
│   │   ├── deployment-architecture.md
│   │   ├── configuration.md
│   │   └── monitoring.md
│   ├── planning/
│   │   └── implementation-roadmap.md
│   ├── testing/
│   │   └── testing-strategy.md
│   └── security/
│       └── security-implementation.md
│
├── .github/                         # GitHub configuration
│   ├── workflows/                   # GitHub Actions
│   │   ├── ci.yml                   # Continuous Integration
│   │   ├── cd.yml                   # Continuous Deployment
│   │   ├── tests.yml                # Test runner
│   │   └── security-scan.yml        # Security scanning
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   ├── feature_request.md
│   │   └── question.md
│   └── PULL_REQUEST_TEMPLATE.md
│
├── .vscode/                         # VS Code configuration
│   ├── settings.json
│   ├── launch.json
│   ├── tasks.json
│   └── extensions.json
│
├── README.md                        # Project README
├── CONTRIBUTING.md                  # Contribution guidelines
├── LICENSE                          # License file
├── .gitignore                       # Git ignore rules
├── .env.example                     # Environment variables template
└── docker-compose.yml               # Local development setup
```

---

## Directory Explanations

### Frontend (`frontend/`)

**Purpose**: Next.js 14 application providing the user interface for RepoMind AI.

**Key Directories:**
- `app/`: Next.js App Router with route groups for authentication and dashboard
- `components/`: Reusable React components organized by feature
- `lib/`: Utility libraries for API calls, WebSocket, and helpers
- `hooks/`: Custom React hooks for state management and side effects
- `stores/`: Zustand stores for global state management
- `types/`: TypeScript type definitions

**Entry Point**: [`frontend/src/app/layout.tsx`](frontend/src/app/layout.tsx:1)

### Backend (`backend/`)

**Purpose**: FastAPI application providing REST API, WebSocket, and business logic.

**Key Directories:**
- `api/`: API endpoints and WebSocket handlers
- `services/`: Business logic layer
- `agents/`: AI agent implementations
- `parsers/`: Language-specific code parsers
- `rag/`: RAG pipeline components
- `models/`: Pydantic data models
- `db/`: Database layer with repositories and migrations
- `vector_store/`: ChromaDB integration
- `cache/`: Redis caching layer

**Entry Point**: [`backend/main.py`](backend/main.py:1)

### Agents (`agents/`)

**Purpose**: Optional standalone microservices for each AI agent (if deploying as separate services).

**Structure**: Each agent has its own directory with source code, Dockerfile, and dependencies.

### Shared (`shared/`)

**Purpose**: Code shared between frontend, backend, and agents.

**Contents**: Type definitions, constants, and utility functions used across services.

### Infrastructure (`infrastructure/`)

**Purpose**: Infrastructure as Code for deployment.

**Key Directories:**
- `kubernetes/`: Kubernetes manifests for container orchestration
- `terraform/`: Terraform configurations for cloud resources
- `docker/`: Dockerfiles and docker-compose for containerization

### Scripts (`scripts/`)

**Purpose**: Utility scripts for development, testing, and deployment.

**Key Scripts:**
- `setup.sh`: Initialize local development environment
- `seed_data.py`: Populate database with sample data
- `migrate.sh`: Run database migrations
- `deploy.sh`: Deploy to production
- `test.sh`: Run test suite

### Docs (`docs/`)

**Purpose**: Comprehensive project documentation.

**Structure**: Organized by topic (architecture, API, agents, deployment, etc.)

### .github (`.github/`)

**Purpose**: GitHub-specific configuration.

**Contents**: GitHub Actions workflows, issue templates, PR templates

---

## File Naming Conventions

### Python Files
- **Modules**: `snake_case.py` (e.g., `repository_service.py`)
- **Classes**: `PascalCase` (e.g., `class RepositoryService`)
- **Functions**: `snake_case` (e.g., `def process_repository()`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_FILE_SIZE`)

### TypeScript Files
- **Components**: `PascalCase.tsx` (e.g., `ChatInterface.tsx`)
- **Utilities**: `camelCase.ts` (e.g., `apiClient.ts`)
- **Types**: `camelCase.ts` (e.g., `repository.ts`)
- **Hooks**: `use` prefix + `PascalCase.ts` (e.g., `useAuth.ts`)

### Configuration Files
- **YAML**: `kebab-case.yaml` (e.g., `docker-compose.yml`)
- **JSON**: `kebab-case.json` (e.g., `package.json`)
- **Environment**: `.env.example`, `.env.local`

---

## Import Path Conventions

### Frontend (TypeScript)
```typescript
// Absolute imports from src/
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api-client'
```

### Backend (Python)
```python
# Absolute imports from src/
from src.services.repository_service import RepositoryService
from src.agents.documentation_agent import DocumentationAgent
from src.models.repository import Repository
```

---

## Hot Files and Modules

**Frequently Modified Files:**
- [`backend/src/agents/orchestrator.py`](backend/src/agents/orchestrator.py:1) - Agent coordination logic
- [`backend/src/rag/retriever.py`](backend/src/rag/retriever.py:1) - RAG retrieval logic
- [`frontend/src/components/chat/ChatInterface.tsx`](frontend/src/components/chat/ChatInterface.tsx:1) - Main chat UI
- [`backend/src/api/v1/endpoints/queries.py`](backend/src/api/v1/endpoints/queries.py:1) - Query API endpoints

**Core Modules (Rarely Changed):**
- [`backend/src/core/config.py`](backend/src/core/config.py:1) - Configuration management
- [`backend/src/db/base.py`](backend/src/db/base.py:1) - Database base classes
- [`frontend/src/lib/api-client.ts`](frontend/src/lib/api-client.ts:1) - API client

---

## Development Workflow

1. **Feature Development**: Create feature branch, implement in appropriate directory
2. **Testing**: Add tests in corresponding `tests/` directory
3. **Documentation**: Update relevant docs in `docs/` directory
4. **Pull Request**: Submit PR with changes, tests, and documentation

---

## Next Steps

- Set up project structure using provided directory layout
- Initialize git repository with proper `.gitignore`
- Configure development environment
- Begin Phase 1 implementation

For more details, see the main project plan in [`REPOMIND_AI_PROJECT_PLAN.md`](../../REPOMIND_AI_PROJECT_PLAN.md).