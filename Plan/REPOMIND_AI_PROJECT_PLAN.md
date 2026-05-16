# RepoMind AI - Comprehensive Project Plan
## Intelligent Code Analysis and Documentation System

**Version:** 1.0  
**Last Updated:** May 16, 2026  
**Status:** Planning Phase  
**Project Type:** Multi-Agent AI System for Repository Intelligence

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Purpose and Context](#2-purpose-and-context)
3. [System Architecture](#3-system-architecture)
4. [Project Structure](#4-project-structure)
5. [Data Models and Schemas](#5-data-models-and-schemas)
6. [AI Agent Specifications](#6-ai-agent-specifications)
7. [RAG Pipeline Architecture](#7-rag-pipeline-architecture)
8. [API Contracts](#8-api-contracts)
9. [Configuration Management](#9-configuration-management)
10. [Implementation Roadmap](#10-implementation-roadmap)
11. [Development Workflow](#11-development-workflow)
12. [Testing Strategy](#12-testing-strategy)
13. [Deployment Architecture](#13-deployment-architecture)
14. [Monitoring and Observability](#14-monitoring-and-observability)
15. [Security Implementation](#15-security-implementation)
16. [Performance Optimization](#16-performance-optimization)
17. [Success Metrics](#17-success-metrics)

---

## 1. Executive Summary

### 1.1 Project Overview

RepoMind AI is an intelligent code analysis and documentation system that leverages five specialized AI agents working in orchestration to provide comprehensive repository intelligence. The system reduces developer onboarding time by 85% through automated documentation, interactive visualizations, and conversational code understanding.

### 1.2 Core Value Proposition

**Problem Being Solved:**
- Developers spend 23 hours/week understanding existing code
- 67% of repositories lack comprehensive documentation
- Complex interdependencies cause 40% of production bugs
- Technical debt costs $3.61 per line of code annually
- New developer onboarding takes 2-4 weeks

**Solution:**
- AI-powered conversational interface for code understanding
- Automated generation of READMEs, API docs, and architecture diagrams
- Real-time security scanning and vulnerability detection
- Intelligent refactoring suggestions with impact analysis
- Test coverage analysis and test case generation
- Interactive dependency graphs and system visualizations

### 1.3 Target Users

**Primary Users:**
- Software developers (individual contributors)
- Engineering teams (5-50 developers)
- Technical leads and architects
- DevOps and SRE teams

**Secondary Users:**
- Product managers (understanding technical constraints)
- Technical writers (documentation generation)
- Security teams (vulnerability scanning)
- Open-source maintainers

### 1.4 Project Goals

**Explicit Goals:**
1. Reduce onboarding time from weeks to days (85% reduction)
2. Automate comprehensive documentation generation
3. Enable natural language code queries with <3s response time
4. Visualize complex architecture and dependencies interactively
5. Predict code change impact before implementation
6. Detect and quantify technical debt with actionable insights
7. Support 15+ programming languages

**Non-Goals:**
- Not a code editor or IDE replacement
- Not a version control system
- Not a CI/CD pipeline tool
- Not a project management system
- Not a code execution environment
- Not a real-time collaboration platform (beyond analysis sharing)

### 1.5 Design Philosophy

**Core Principles:**
1. **Intelligence First**: AI agents should provide insights, not just information
2. **Context Preservation**: Maintain semantic relationships between code elements
3. **Incremental Processing**: Support real-time updates for active repositories
4. **Multi-Modal Understanding**: Combine code, documentation, and architecture
5. **Explainability**: Always provide sources and reasoning for AI responses
6. **Performance**: Sub-3-second response times for 90% of queries
7. **Scalability**: Handle repositories up to 500K files
8. **Security**: Zero-trust architecture with data encryption

### 1.6 Competitive Advantages

**vs. GitHub Copilot:**
- Repository-wide understanding (not just file-level)
- Automated documentation generation
- Architecture visualization
- Technical debt analysis
- Multi-agent specialization

**vs. Sourcegraph:**
- AI-powered conversational interface
- Predictive impact analysis
- Automated refactoring suggestions
- Real-time security scanning
- Test coverage analysis

**vs. Tabnine:**
- Complete repository intelligence (not just code completion)
- Documentation generation
- Architecture diagrams
- Security vulnerability detection
- Cross-repository learning

**Unique Features:**
- Five specialized AI agents working in orchestration
- Code Impact Prediction Engine
- Cross-Repository Learning from thousands of codebases
- Intelligent Code Migration Assistant
- Real-time collaborative analysis

---

## 2. Purpose and Context

### 2.1 Problem Statement Deep Dive

**Developer Productivity Crisis:**

Modern software development faces a critical productivity bottleneck. According to the 2025 Stripe Developer Survey, developers spend an average of 23 hours per week—nearly 60% of their time—understanding and navigating existing code rather than writing new features. This "code comprehension tax" costs the industry billions annually.

**Key Statistics:**
- **$300B**: Annual cost of poor software quality (CISQ Report 2025)
- **2-4 weeks**: Average onboarding time for new developers
- **67%**: Repositories lacking comprehensive documentation (GitHub Survey 2025)
- **40%**: Production bugs caused by hidden dependencies
- **6 months**: Time to fully onboard senior developers
- **$3.61**: Cost per line of code for technical debt annually

**Root Causes:**
1. **Documentation Decay**: Documentation becomes outdated within weeks of creation
2. **Knowledge Silos**: Critical architectural knowledge exists only in senior developers' minds
3. **Complexity Growth**: Modern applications have thousands of interdependent components
4. **Legacy Code**: Modernization requires months of manual analysis
5. **Context Switching**: Developers lose 23 minutes of productivity per interruption

### 2.2 Target User Personas

**Persona 1: Sarah - Mid-Level Backend Developer**
- **Background**: 3 years experience, recently joined a new team
- **Pain Points**: Struggles to understand legacy authentication system, unclear dependencies
- **Goals**: Quickly understand codebase to start contributing
- **How RepoMind Helps**: Conversational queries about authentication flow, dependency visualization

**Persona 2: Marcus - Senior Engineering Lead**
- **Background**: 10 years experience, managing team of 12 developers
- **Pain Points**: Onboarding new team members takes too long, technical debt accumulating
- **Goals**: Reduce onboarding time, identify refactoring priorities
- **How RepoMind Helps**: Automated documentation, technical debt analysis, architecture diagrams

**Persona 3: Priya - DevOps Engineer**
- **Background**: 5 years experience, responsible for deployment pipeline
- **Pain Points**: Security vulnerabilities discovered in production, unclear service dependencies
- **Goals**: Proactive security scanning, understand service architecture
- **How RepoMind Helps**: Real-time security scanning, service dependency maps

**Persona 4: Alex - Open Source Maintainer**
- **Background**: Maintains popular library with 50K+ stars
- **Pain Points**: Contributors struggle to understand codebase, documentation maintenance burden
- **Goals**: Lower contribution barrier, maintain up-to-date documentation
- **How RepoMind Helps**: Auto-generated contributor guides, API documentation

### 2.3 Success Criteria

**Technical Metrics:**
- Query response time: <3 seconds for 90% of queries
- Documentation accuracy: 92% validated against manual reviews
- Embedding generation: <5 minutes for 100K LOC repository
- System uptime: 99.9% availability
- Concurrent users: Support 1000+ simultaneous queries

**Business Metrics:**
- Onboarding time reduction: 85% (from 2-4 weeks to 2-3 days)
- Developer productivity increase: 30% (measured by feature velocity)
- Documentation coverage: 95% of repositories with complete docs
- User satisfaction: NPS score >50
- Adoption rate: 70% of team members using weekly

**User Experience Metrics:**
- Time to first insight: <2 minutes after repository upload
- Query success rate: 85% of queries answered satisfactorily
- Documentation quality: 4.5/5 average rating
- Feature discovery: 80% of users discover 3+ features in first week

---

## 3. System Architecture

### 3.1 High-Level Architecture

RepoMind AI follows a layered architecture with clear separation of concerns. See detailed architecture diagram in [`docs/architecture/system-architecture.md`](docs/architecture/system-architecture.md).

**Architecture Layers:**

1. **Presentation Layer**: Web UI, Mobile UI, CLI
2. **API Gateway Layer**: FastAPI, Authentication, Rate Limiting
3. **Business Logic Layer**: Services, Query Processing, Orchestration
4. **AI Agent Layer**: 5 Specialized Agents
5. **AI/ML Infrastructure**: Granite Models, RAG Pipeline
6. **Data Layer**: ChromaDB, PostgreSQL, Redis, S3

### 3.2 Component Descriptions

**Presentation Layer:**
- **Web UI**: React 18 + Next.js 14 with App Router, Tailwind CSS
- **Mobile UI**: React Native for iOS/Android (future phase)
- **CLI Tool**: Python-based command-line interface for CI/CD integration

**API Gateway Layer:**
- **FastAPI Gateway**: High-performance async API server
- **Authentication**: OAuth 2.0 + JWT tokens, GitHub OAuth integration
- **Rate Limiting**: Redis-based token bucket algorithm
- **WebSocket**: Real-time streaming responses for AI queries

**Business Logic Layer:**
- **Repository Service**: Handles repository upload, parsing, and indexing
- **Query Processor**: Processes user queries, intent classification
- **Agent Orchestrator**: Coordinates multi-agent collaboration

**AI Agent Layer:**
- **Documentation Agent**: Generates READMEs, API docs, guides
- **Security Agent**: Scans for vulnerabilities, secrets, unsafe patterns
- **Refactor Agent**: Identifies code smells, suggests improvements
- **Testing Agent**: Analyzes coverage, generates test cases
- **Architecture Agent**: Creates dependency graphs, system diagrams

**AI/ML Infrastructure:**
- **IBM Granite Models**: Code-specialized LLMs (8B/20B/34B parameters)
- **RAG Pipeline**: Retrieval-Augmented Generation for context-aware responses
- **Embedding Generation**: IBM Granite Embedding Model (768 dimensions)

**Data Layer:**
- **ChromaDB**: Vector database for code embeddings
- **PostgreSQL**: Relational database for metadata, users, analytics
- **Redis**: In-memory cache for query results, sessions
- **S3/Object Storage**: Repository files, generated documentation

### 3.3 Key Design Patterns

**1. Multi-Agent Pattern**
- **Pattern**: Specialized agents with single responsibilities
- **Justification**: Enables parallel processing, easier maintenance, specialized expertise
- **Implementation**: Event-driven communication via message bus

**2. Repository Pattern**
- **Pattern**: Abstract data access layer
- **Justification**: Decouples business logic from data storage, enables testing
- **Implementation**: Separate repositories for User, Repository, Query, Agent

**3. Strategy Pattern**
- **Pattern**: Pluggable algorithms for different languages/frameworks
- **Justification**: Supports multiple programming languages with language-specific parsers
- **Implementation**: Language-specific AST parsers, embedding strategies

**4. Observer Pattern**
- **Pattern**: Event-driven architecture for agent communication
- **Justification**: Loose coupling between agents, asynchronous processing
- **Implementation**: Redis pub/sub for agent events

**5. Circuit Breaker Pattern**
- **Pattern**: Fault tolerance for external API calls
- **Justification**: Prevents cascade failures, graceful degradation
- **Implementation**: Retry logic with exponential backoff for AI model calls

**6. CQRS (Command Query Responsibility Segregation)**
- **Pattern**: Separate read and write models
- **Justification**: Optimized read performance for queries, write consistency for updates
- **Implementation**: Separate query and command handlers

### 3.4 Data Flow Diagrams

**Repository Upload Flow:**
```
User Upload → API Gateway → Repository Service → Parser
    ↓
AST Extraction → Dependency Analysis → Chunking
    ↓
Embedding Generation → Vector Storage (ChromaDB)
    ↓
Metadata Storage (PostgreSQL) → Indexing Complete
```

**Query Processing Flow:**
```
User Query → API Gateway → Query Processor
    ↓
Intent Classification → Agent Selection
    ↓
Orchestrator → [Doc Agent, Security Agent, etc.] (Parallel)
    ↓
RAG Pipeline: Retrieval → Context Compression → Generation
    ↓
Response Synthesis → Citation Addition → Stream to User
```

**Agent Orchestration Flow:**
```
Orchestrator receives query
    ↓
Analyze query intent and complexity
    ↓
Select relevant agents (1-5 agents)
    ↓
Dispatch tasks to agents (parallel execution)
    ↓
Agents retrieve context from ChromaDB
    ↓
Agents process with Granite models
    ↓
Agents return results to Orchestrator
    ↓
Orchestrator synthesizes final response
    ↓
Stream response to user with citations
```

---

## 4. Project Structure

For detailed directory structure, see [`docs/architecture/directory-structure.md`](docs/architecture/directory-structure.md).

### 4.1 High-Level Structure

```
repomind-ai/
├── frontend/          # Next.js frontend application
├── backend/           # FastAPI backend application
├── agents/            # Standalone agent services (optional)
├── shared/            # Shared code between services
├── infrastructure/    # Infrastructure as Code
├── scripts/           # Utility scripts
├── docs/              # Documentation
└── .github/           # GitHub configuration
```

### 4.2 Entry Points

**Frontend Entry Point:**
- **File**: [`frontend/src/app/layout.tsx`](frontend/src/app/layout.tsx:1)
- **Purpose**: Root layout component, initializes providers

**Backend Entry Point:**
- **File**: [`backend/main.py`](backend/main.py:1)
- **Purpose**: FastAPI application initialization

**Agent Orchestrator Entry:**
- **File**: [`backend/src/agents/orchestrator.py`](backend/src/agents/orchestrator.py:1)
- **Purpose**: Coordinates multi-agent execution

### 4.3 Core Modules vs Utilities

**Core Modules (Business Logic):**
- [`backend/src/services/`](backend/src/services/) - Business logic services
- [`backend/src/agents/`](backend/src/agents/) - AI agent implementations
- [`backend/src/rag/`](backend/src/rag/) - RAG pipeline
- [`backend/src/parsers/`](backend/src/parsers/) - Code parsers

**Utility Modules (Helpers):**
- [`backend/src/utils/`](backend/src/utils/) - General utilities
- [`backend/src/core/`](backend/src/core/) - Configuration, logging
- [`frontend/src/lib/`](frontend/src/lib/) - Frontend utilities

---

## 5. Data Models and Schemas

For complete data model specifications, see [`docs/architecture/data-models.md`](docs/architecture/data-models.md).

### 5.1 Core Entities

- **User**: User accounts and authentication
- **Repository**: Code repositories with metadata
- **Query**: User queries and responses
- **CodeElement**: Individual code constructs (functions, classes, etc.)
- **Documentation**: Generated documentation artifacts
- **Agent**: AI agent execution logs

### 5.2 Database Schema

**PostgreSQL Tables:**
- users
- repositories
- queries
- code_elements
- documentation
- agent_logs

**ChromaDB Collections:**
- One collection per repository
- 768-dimensional embeddings
- Rich metadata for filtering

---

## 6. AI Agent Specifications

For detailed agent specifications, see [`docs/agents/`](docs/agents/) directory.

### 6.1 Documentation Agent

**Purpose**: Automatically generates and maintains comprehensive documentation synchronized with codebase changes.

**Capabilities:**
- README.md generation
- API documentation
- Onboarding guides
- Architecture documentation
- Changelog generation

**Model**: IBM Granite 20B Code

### 6.2 Security Agent

**Purpose**: Continuously scans for hardcoded secrets, unsafe coding patterns, exposed endpoints, and vulnerability risks.

**Capabilities:**
- Secret detection (API keys, passwords)
- Vulnerability scanning
- Unsafe pattern detection
- Dependency audit
- Compliance checking

**Model**: IBM Granite 20B Code + Specialized security rules

### 6.3 Refactor Agent

**Purpose**: Identifies code duplication, cyclomatic complexity, technical debt, and refactoring opportunities.

**Capabilities:**
- Code smell detection
- Complexity analysis
- Duplication identification
- Refactoring suggestions
- Impact analysis

**Model**: IBM Granite 34B Code

### 6.4 Testing Agent

**Purpose**: Analyzes code coverage gaps, maps untested modules, and generates targeted test case proposals.

**Capabilities:**
- Coverage analysis
- Test gap identification
- Test case generation
- Test quality assessment
- Mutation testing suggestions

**Model**: IBM Granite 20B Code

### 6.5 Architecture Agent

**Purpose**: Constructs interactive module dependency graphs, API flow diagrams, service maps, and system architecture visualizations.

**Capabilities:**
- Dependency graph generation
- Architecture diagram creation
- Service map visualization
- Pattern recognition
- Scalability assessment

**Model**: IBM Granite 34B Code

---

## 7. RAG Pipeline Architecture

For detailed RAG pipeline specifications, see [`docs/architecture/rag-pipeline.md`](docs/architecture/rag-pipeline.md).

### 7.1 Pipeline Stages

1. **Query Understanding**: Intent classification, entity extraction
2. **Hybrid Retrieval**: Vector similarity + BM25 keyword search
3. **Context Compression**: LLMLingua for token reduction
4. **Multi-Agent Collaboration**: Parallel agent processing
5. **Response Generation**: Streaming with citations
6. **Verification**: Confidence scoring, source attribution

### 7.2 Embedding Strategy

- **Model**: IBM Granite Embedding Model
- **Dimensions**: 768
- **Chunking**: Semantic chunking preserving logical boundaries
- **Metadata**: File path, dependencies, complexity, language

---

## 8. API Contracts

For complete API documentation, see [`docs/api/`](docs/api/) directory.

### 8.1 REST API Endpoints

**Authentication:**
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/logout`

**Repositories:**
- `GET /api/v1/repositories`
- `POST /api/v1/repositories`
- `GET /api/v1/repositories/{id}`
- `DELETE /api/v1/repositories/{id}`

**Queries:**
- `POST /api/v1/queries`
- `GET /api/v1/queries/{id}`
- `GET /api/v1/queries/history`

**Documentation:**
- `GET /api/v1/documentation/{repository_id}`
- `POST /api/v1/documentation/generate`

### 8.2 WebSocket Endpoints

**Chat:**
- `WS /ws/chat/{repository_id}`

---

## 9. Configuration Management

For detailed configuration specifications, see [`docs/deployment/configuration.md`](docs/deployment/configuration.md).

### 9.1 Environment Variables

**Required:**
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `CHROMADB_HOST`: ChromaDB host
- `IBM_WATSONX_API_KEY`: IBM watsonx.ai API key
- `JWT_SECRET_KEY`: JWT signing key

**Optional:**
- `LOG_LEVEL`: Logging level (default: INFO)
- `MAX_WORKERS`: Worker pool size (default: 4)
- `CACHE_TTL`: Cache TTL in seconds (default: 3600)

### 9.2 Configuration Files

- `backend/config/default.yaml`: Default configuration
- `backend/config/production.yaml`: Production overrides
- `backend/config/development.yaml`: Development overrides

---

## 10. Implementation Roadmap

For detailed implementation roadmap, see [`docs/planning/implementation-roadmap.md`](docs/planning/implementation-roadmap.md).

### 10.1 Phase 1: Foundation (Weeks 1-4)

**Goals:**
- Set up development environment
- Implement core infrastructure
- Basic repository parsing
- Simple query processing

**Deliverables:**
- Project scaffolding
- Database schema
- Basic API endpoints
- Repository upload functionality

### 10.2 Phase 2: AI Integration (Weeks 5-8)

**Goals:**
- Integrate IBM Granite models
- Implement RAG pipeline
- Build agent orchestrator
- Basic documentation generation

**Deliverables:**
- Working RAG pipeline
- Agent orchestrator
- Documentation agent
- Query processing

### 10.3 Phase 3: Agent Development (Weeks 9-12)

**Goals:**
- Implement all 5 agents
- Agent communication protocol
- Multi-agent orchestration
- Advanced features

**Deliverables:**
- All 5 agents operational
- Security scanning
- Refactoring suggestions
- Test coverage analysis
- Architecture visualization

### 10.4 Phase 4: Polish & Launch (Weeks 13-16)

**Goals:**
- Performance optimization
- UI/UX refinement
- Testing and QA
- Documentation
- Deployment

**Deliverables:**
- Production-ready system
- Complete documentation
- Deployment pipeline
- Monitoring setup

---

## 11. Development Workflow

For detailed development workflow, see [`CONTRIBUTING.md`](CONTRIBUTING.md).

### 11.1 Branching Strategy

- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: Feature branches
- `bugfix/*`: Bug fix branches
- `hotfix/*`: Production hotfixes

### 11.2 Pull Request Process

1. Create feature branch from `develop`
2. Implement changes with tests
3. Run linters and formatters
4. Submit PR with description
5. Code review (2 approvals required)
6. Merge to `develop`

### 11.3 Code Style Guidelines

**Python:**
- PEP 8 compliance
- Black formatter
- isort for imports
- Type hints required

**TypeScript:**
- ESLint + Prettier
- Strict mode enabled
- Functional components preferred

---

## 12. Testing Strategy

For detailed testing strategy, see [`docs/testing/testing-strategy.md`](docs/testing/testing-strategy.md).

### 12.1 Test Types

**Unit Tests:**
- Individual functions and classes
- Mocked dependencies
- Fast execution (<1s per test)
- Coverage target: 80%

**Integration Tests:**
- Service interactions
- Database operations
- API endpoints
- Coverage target: 70%

**End-to-End Tests:**
- Complete user workflows
- UI interactions
- Real dependencies
- Coverage target: 60%

### 12.2 Test Execution

```bash
# Run all tests
pytest

# Run unit tests only
pytest tests/unit

# Run with coverage
pytest --cov=src --cov-report=html

# Run specific test
pytest tests/unit/test_agents.py::test_documentation_agent
```

---

## 13. Deployment Architecture

For detailed deployment specifications, see [`docs/deployment/deployment-architecture.md`](docs/deployment/deployment-architecture.md).

### 13.1 Kubernetes Deployment

**Components:**
- Frontend: 3 replicas
- Backend: 5 replicas
- ChromaDB: StatefulSet
- PostgreSQL: Managed service
- Redis: Managed service

### 13.2 CI/CD Pipeline

**GitHub Actions Workflow:**
1. Lint and format check
2. Run tests
3. Build Docker images
4. Push to registry
5. Deploy to staging
6. Run E2E tests
7. Deploy to production (manual approval)

---

## 14. Monitoring and Observability

For detailed monitoring specifications, see [`docs/deployment/monitoring.md`](docs/deployment/monitoring.md).

### 14.1 Key Metrics

**Application Metrics:**
- Request rate
- Response time (p50, p95, p99)
- Error rate
- Query processing time
- Agent execution time

**Infrastructure Metrics:**
- CPU usage
- Memory usage
- Disk I/O
- Network traffic

### 14.2 Alerting Rules

- Response time > 5s for 5 minutes
- Error rate > 5% for 5 minutes
- CPU usage > 80% for 10 minutes
- Memory usage > 85% for 10 minutes

---

## 15. Security Implementation

For detailed security specifications, see [`docs/security/security-implementation.md`](docs/security/security-implementation.md).

### 15.1 Authentication & Authorization

- OAuth 2.0 + JWT tokens
- GitHub OAuth integration
- Role-based access control (RBAC)
- API key authentication for CLI

### 15.2 Data Security

- Encryption at rest (AES-256)
- Encryption in transit (TLS 1.3)
- Secrets management (HashiCorp Vault)
- Regular security audits

---

## 16. Performance Optimization

For detailed performance specifications, see [`docs/architecture/performance-optimization.md`](docs/architecture/performance-optimization.md).

### 16.1 Caching Strategy

**Query Results:**
- Redis cache with 1-hour TTL
- Cache key: hash(query_text + repository_id)

**Embeddings:**
- Persistent ChromaDB storage
- Incremental updates only

**API Responses:**
- CDN caching for static assets
- HTTP caching headers

### 16.2 Query Optimization

- Hybrid search (vector + BM25)
- Context compression
- Batch processing
- Parallel agent execution

---

## 17. Success Metrics

### 17.1 Technical Metrics

- Query response time: <3 seconds (90th percentile)
- System uptime: 99.9%
- Embedding generation: <5 minutes per 100K LOC
- Concurrent users: 1000+

### 17.2 Business Metrics

- Onboarding time reduction: 85%
- Developer productivity increase: 30%
- Documentation coverage: 95%
- User satisfaction: NPS >50

### 17.3 User Experience Metrics

- Time to first insight: <2 minutes
- Query success rate: 85%
- Documentation quality: 4.5/5
- Feature discovery: 80% discover 3+ features

---

## Next Steps

1. Review and approve this project plan
2. Set up development environment
3. Begin Phase 1 implementation
4. Schedule weekly progress reviews

For questions or clarifications, please refer to the detailed documentation in the [`docs/`](docs/) directory or contact the project team.